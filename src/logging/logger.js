/**
 * Structured logger.
 *
 * Every entry is one JSON object. Entries go to:
 *   1. an in-memory ring buffer (read by the in-app Diagnostics screen),
 *   2. logcat, as a single line prefixed with "TBLOG " (read by scripts/logs.js),
 *   3. any extra sinks that were registered (the on-device JSONL file sink).
 *
 * Issues (major / minor problems) are registered via reportIssue() and deduplicated
 * by code + key, so a problem that repeats 200 times shows once with count 200.
 */

import { getIssueDefinition, SEVERITY } from './issueCatalog';

export const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

export const FEATURES = {
  APP: 'APP',
  NAV: 'NAV',
  FARE: 'FARE',
  FOOD: 'FOOD',
  LOCATION: 'LOCATION',
  SEARCH: 'SEARCH',
  NETWORK: 'NETWORK',
  DB: 'DB',
  UI: 'UI',
  CITY: 'CITY',
};

export const LOGCAT_PREFIX = 'TBLOG ';
const MAX_BUFFER = 3000;
// Android's logger truncates a single line at ~4 KB; keep JSON well under that.
const MAX_LINE_CHARS = 3500;

// console.log is captured before anything patches console, so logger output
// can never recurse through the console.warn/error capture in globalHandlers.
const rawConsoleLog = typeof console !== 'undefined' ? console.log.bind(console) : () => {};

const state = {
  sessionId: makeSessionId(),
  sessionStart: Date.now(),
  seq: 0,
  buffer: [],
  issues: new Map(),
  sinks: [],
  listeners: new Set(),
  minLevel: LEVELS.debug,
  // Silent under jest; tests opt in via configureLogger({ logcat: true }).
  logcatEnabled: !(typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID),
  context: {},
};

function makeSessionId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `${stamp}-${Math.random().toString(36).slice(2, 6)}`;
}

const SECRET_PATTERNS = [
  [/([?&](?:key|apiKey|api_key|token|access_token)=)[^&\s"]+/gi, '$1<redacted>'],
  [/(Bearer\s+)[A-Za-z0-9._\-+/=]+/g, '$1<redacted>'],
];

export function redact(text) {
  if (typeof text !== 'string') return text;
  return SECRET_PATTERNS.reduce((acc, [re, rep]) => acc.replace(re, rep), text);
}

/** Converts Error objects and other non-JSON values into loggable data. */
export function serializeError(err) {
  if (!err) return null;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: redact(err.message),
      stack: err.stack ? redact(String(err.stack)).split('\n').slice(0, 12).join('\n') : undefined,
    };
  }
  if (typeof err === 'object') return err;
  return { message: redact(String(err)) };
}

function safeData(data) {
  if (data === undefined) return undefined;
  if (data instanceof Error) return serializeError(data);
  try {
    // Round-trip through JSON so the buffer never holds live objects (and cycles fail fast).
    return JSON.parse(
      JSON.stringify(data, (k, v) => {
        if (v instanceof Error) return serializeError(v);
        if (typeof v === 'string') return redact(v);
        if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
        return v;
      }),
    );
  } catch (e) {
    return { unserializable: true, reason: String(e && e.message) };
  }
}

function toLogcatLine(entry) {
  let json = JSON.stringify(entry);
  if (json.length > MAX_LINE_CHARS) {
    const slim = {
      ...entry,
      data: { truncated: true, preview: JSON.stringify(entry.data).slice(0, 1500) },
    };
    json = JSON.stringify(slim);
  }
  return LOGCAT_PREFIX + json;
}

function emit(entry) {
  state.buffer.push(entry);
  if (state.buffer.length > MAX_BUFFER) {
    state.buffer.splice(0, state.buffer.length - MAX_BUFFER);
  }
  if (state.logcatEnabled) {
    rawConsoleLog(toLogcatLine(entry));
  }
  for (const sink of state.sinks) {
    try {
      sink.write(entry);
    } catch {
      // A failing sink must never break logging for the others.
    }
  }
  for (const listener of state.listeners) {
    try {
      listener(entry);
    } catch {
      // Listener errors are ignored on purpose.
    }
  }
}

function write(level, feature, event, data, extra = {}) {
  if (LEVELS[level] < state.minLevel) return null;
  state.seq += 1;
  const entry = {
    seq: state.seq,
    ts: new Date().toISOString(),
    t: Date.now() - state.sessionStart,
    sid: state.sessionId,
    lvl: level,
    f: feature || FEATURES.APP,
    ev: event,
    ...extra,
  };
  const clean = safeData(data);
  if (clean !== undefined) entry.data = clean;
  if (state.context.screen) entry.screen = state.context.screen;
  emit(entry);
  return entry;
}

export const log = {
  debug: (feature, event, data) => write('debug', feature, event, data),
  info: (feature, event, data) => write('info', feature, event, data),
  warn: (feature, event, data) => write('warn', feature, event, data),
  error: (feature, event, data) => write('error', feature, event, data),

  /**
   * Measures an operation. Usage:
   *   const done = log.time(FEATURES.FOOD, 'osm.fetch');
   *   ... await work ...
   *   done({ count: 12 });          // info entry with durationMs
   *   done.fail(err, { endpoint }); // warn entry with durationMs + error
   */
  time(feature, event, startData) {
    const start = Date.now();
    if (startData !== undefined) write('debug', feature, `${event}.start`, startData);
    const done = (data) =>
      write('info', feature, event, { ...(data || {}), durationMs: Date.now() - start });
    done.fail = (err, data) =>
      write('warn', feature, `${event}.failed`, {
        ...(data || {}),
        durationMs: Date.now() - start,
        error: serializeError(err),
      });
    return done;
  },
};

/**
 * Records a problem. `code` must exist in issueCatalog.js — that decides MAJOR vs MINOR.
 * `key` distinguishes instances (e.g. restaurant id) so each is counted separately.
 */
export function reportIssue(code, { key = '', message, data } = {}) {
  const def = getIssueDefinition(code);
  const id = `${code}::${key}`;
  const now = new Date().toISOString();
  const existing = state.issues.get(id);
  const isNew = !existing;
  const issue = existing || {
    id,
    code,
    key,
    severity: def.severity,
    feature: def.feature,
    title: def.title,
    hint: def.hint,
    firstSeen: now,
    count: 0,
  };
  issue.count += 1;
  issue.lastSeen = now;
  if (message) issue.message = redact(String(message));
  if (data !== undefined) issue.data = safeData(data);
  state.issues.set(id, issue);

  // Log the first occurrence in full; later repeats are logged at debug level only,
  // so a looping failure cannot flood logcat.
  write(
    isNew ? (def.severity === SEVERITY.MAJOR ? 'error' : 'warn') : 'debug',
    def.feature,
    `issue.${code}`,
    {
      key,
      message: issue.message,
      count: issue.count,
      ...(data !== undefined ? { detail: issue.data } : {}),
    },
    { sev: def.severity, code },
  );
  return issue;
}

export function getIssues({ severity } = {}) {
  const all = Array.from(state.issues.values());
  const filtered = severity ? all.filter((i) => i.severity === severity) : all;
  return filtered.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
}

export function getEntries({ feature, minLevel, limit } = {}) {
  let list = state.buffer;
  if (feature) list = list.filter((e) => e.f === feature);
  if (minLevel) list = list.filter((e) => LEVELS[e.lvl] >= LEVELS[minLevel]);
  if (limit) list = list.slice(-limit);
  return list;
}

export function getSessionInfo() {
  return {
    sessionId: state.sessionId,
    startedAt: new Date(state.sessionStart).toISOString(),
    entries: state.seq,
    buffered: state.buffer.length,
    context: { ...state.context },
  };
}

export function setLogContext(patch) {
  state.context = { ...state.context, ...patch };
}

export function addSink(sink) {
  state.sinks.push(sink);
  return () => {
    state.sinks = state.sinks.filter((s) => s !== sink);
  };
}

export function subscribe(listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function clearLogs() {
  state.buffer = [];
  state.issues = new Map();
  for (const listener of state.listeners) {
    try {
      listener(null);
    } catch {
      // ignore
    }
  }
}

export function configureLogger({ minLevel, logcat } = {}) {
  if (minLevel && LEVELS[minLevel]) state.minLevel = LEVELS[minLevel];
  if (typeof logcat === 'boolean') state.logcatEnabled = logcat;
}

/** Test helper — resets all module state. */
export function __resetLoggerForTests() {
  state.seq = 0;
  state.buffer = [];
  state.issues = new Map();
  state.sinks = [];
  state.listeners = new Set();
  state.context = {};
  state.minLevel = LEVELS.debug;
  state.logcatEnabled = false;
}
