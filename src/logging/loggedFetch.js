/**
 * fetch() wrapper that logs every request: name, URL (keys redacted), HTTP status,
 * duration, and — on failure — the start of the response body so provider error
 * messages (e.g. Google "REQUEST_DENIED", Foursquare 401) end up in the logs.
 *
 * Returns { ok, status, json, text, error, durationMs } and never throws.
 */

import { FEATURES, log, redact, reportIssue, serializeError } from './logger';

export async function loggedFetch(
  url,
  { name, feature = FEATURES.NETWORK, timeoutMs = 8000, parse = 'json', ...init } = {},
) {
  const reqName = name || 'request';
  const started = Date.now();
  const safeUrl = redact(String(url)).slice(0, 400);
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timedOut = false;
  const timer = controller
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs)
    : null;

  log.debug(feature, `net.${reqName}.start`, {
    url: safeUrl,
    method: init.method || 'GET',
    timeoutMs,
  });

  try {
    const res = await fetch(url, { ...init, signal: controller ? controller.signal : undefined });
    const durationMs = Date.now() - started;
    const text = await res.text();
    let json = null;
    if (parse === 'json') {
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }
    }

    const summary = { url: safeUrl, status: res.status, durationMs, bytes: text.length };
    if (!res.ok) {
      const body = redact(text.slice(0, 600));
      log.warn(feature, `net.${reqName}.http_error`, { ...summary, body });
      reportIssue('NET_REQUEST_FAILED', {
        key: reqName,
        message: `HTTP ${res.status} from ${reqName}`,
        data: { ...summary, body },
      });
      return { ok: false, status: res.status, json, text, error: `HTTP ${res.status}`, durationMs };
    }
    if (parse === 'json' && json === null && text) {
      log.warn(feature, `net.${reqName}.bad_json`, {
        ...summary,
        bodyStart: redact(text.slice(0, 300)),
      });
      reportIssue('NET_REQUEST_FAILED', {
        key: reqName,
        message: `Invalid JSON from ${reqName}`,
        data: summary,
      });
      return { ok: false, status: res.status, json: null, text, error: 'invalid_json', durationMs };
    }

    log.info(feature, `net.${reqName}.ok`, summary);
    return { ok: true, status: res.status, json, text, error: null, durationMs };
  } catch (err) {
    const durationMs = Date.now() - started;
    // Expo's fetch reports an abort as "Fetch request has been canceled", so rely on our own flag.
    const reason = timedOut ? `timeout after ${timeoutMs}ms` : 'network error';
    log.warn(feature, `net.${reqName}.failed`, {
      url: safeUrl,
      durationMs,
      reason,
      error: serializeError(err),
    });
    reportIssue('NET_REQUEST_FAILED', {
      key: reqName,
      message: `${reqName}: ${reason}`,
      data: { url: safeUrl, durationMs, error: serializeError(err) },
    });
    return { ok: false, status: 0, json: null, text: '', error: reason, durationMs };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
