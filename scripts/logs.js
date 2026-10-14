#!/usr/bin/env node
/**
 * TravelBuddy log collector (PC side). No dependencies — needs Node + adb.
 *
 *   npm run logs:start   bigger logcat buffer (16 MB) + clear, run BEFORE reproducing a bug
 *   npm run logs:live    stream app logs in colour while you use the app (also saved to a file)
 *   npm run logs:pull    pull everything into device-logs/<timestamp>/ and build report.md
 *   npm run logs:open    open the in-app Diagnostics screen (dev/release build only)
 *   npm run logs:clear   clear logcat
 *
 * Options: --serial <id> (or ANDROID_SERIAL) when several devices are connected.
 *
 * What `pull` collects:
 *   1. logcat lines tagged ReactNativeJS that start with "TBLOG " (one JSON entry each)
 *   2. "TBDUMP" blocks (full in-app report, emitted by "Send to PC" or the deep link)
 *   3. native crashes (AndroidRuntime FATAL, libc SIGSEGV) and React Native errors
 *   4. on debug builds: the app's persisted JSONL files via `run-as` (survive app restarts)
 */

/* global __dirname */
const { execFileSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const PKG = 'app.travelbuddy.companion';
const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'device-logs');
const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith('--')) || 'pull';
const serialArg = args.includes('--serial')
  ? args[args.indexOf('--serial') + 1]
  : process.env.ANDROID_SERIAL;

const C = process.stdout.isTTY
  ? {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      gray: '\x1b[90m',
      bold: '\x1b[1m',
      reset: '\x1b[0m',
    }
  : { red: '', yellow: '', green: '', blue: '', gray: '', bold: '', reset: '' };

function findAdb() {
  const candidates = [];
  const sdk =
    process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    (process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')) ||
    path.join(os.homedir(), 'Library', 'Android', 'sdk');
  if (sdk)
    candidates.push(
      path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb'),
    );
  candidates.push('adb');
  for (const c of candidates) {
    try {
      execFileSync(c, ['version'], { stdio: 'ignore' });
      return c;
    } catch {
      // try next
    }
  }
  console.error(
    `${C.red}adb not found.${C.reset} Install Android platform-tools or set ANDROID_HOME.`,
  );
  process.exit(1);
}

const ADB = findAdb();

function pickSerial() {
  const out = execFileSync(ADB, ['devices'], { encoding: 'utf8' });
  const devices = out
    .split('\n')
    .slice(1)
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => p[1] === 'device')
    .map((p) => p[0]);
  if (serialArg) return serialArg;
  if (devices.length === 0) {
    console.error(
      `${C.red}No device connected.${C.reset} Plug in the phone (USB debugging on) or start the emulator.`,
    );
    process.exit(1);
  }
  if (devices.length > 1)
    console.log(
      `${C.yellow}Several devices: ${devices.join(', ')} — using ${devices[0]} (use --serial to choose).${C.reset}`,
    );
  return devices[0];
}

const SERIAL = pickSerial();
const adb = (a, opts = {}) =>
  execFileSync(ADB, ['-s', SERIAL, ...a], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    ...opts,
  });
const adbTry = (a) => {
  try {
    return adb(a, { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

function parseTblog(line) {
  const i = line.indexOf('TBLOG ');
  if (i < 0) return null;
  let json = line.slice(i + 6).trim();
  // Hermes/console may wrap the string in quotes in some RN versions.
  if (json.startsWith("'") && json.endsWith("'")) json = json.slice(1, -1);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function fmtEntry(e) {
  const color =
    e.lvl === 'error' ? C.red : e.lvl === 'warn' ? C.yellow : e.lvl === 'info' ? C.blue : C.gray;
  const sev = e.sev
    ? `${e.sev === 'major' ? C.red + C.bold + '[MAJOR]' : C.yellow + '[minor]'}${C.reset} `
    : '';
  const data =
    e.data !== undefined ? ` ${C.gray}${JSON.stringify(e.data).slice(0, 300)}${C.reset}` : '';
  return `${C.gray}${(e.ts || '').slice(11, 23)}${C.reset} ${color}${(e.lvl || '').toUpperCase().padEnd(5)}${C.reset} ${sev}[${e.f}] ${e.ev}${data}`;
}

// ---------------------------------------------------------------- commands

async function cmdStart() {
  adbTry(['logcat', '-G', '16M']);
  adb(['logcat', '-c']);
  console.log(
    `${C.green}✔ logcat buffer set to 16 MB and cleared on ${SERIAL}.${C.reset} Now reproduce the problem, then run: npm run logs:pull`,
  );
}

function cmdClear() {
  adb(['logcat', '-c']);
  console.log(`${C.green}✔ logcat cleared on ${SERIAL}${C.reset}`);
}

function cmdOpen() {
  const out = adbTry([
    'shell',
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    'travelbuddy://debug',
    PKG,
  ]);
  console.log(
    out && !/Error/.test(out)
      ? `${C.green}✔ Diagnostics opened${C.reset}`
      : `${C.yellow}Could not open via deep link (Expo Go does not register travelbuddy://). Use Guide tab → 🐞 Diagnostics.${C.reset}`,
  );
}

function cmdLive() {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const file = path.join(OUT_ROOT, `live-${stamp()}.jsonl`);
  const sink = fs.createWriteStream(file);
  console.log(
    `${C.bold}Streaming TravelBuddy logs from ${SERIAL}${C.reset} (Ctrl+C to stop) → ${path.relative(ROOT, file)}`,
  );
  const child = spawn(ADB, [
    '-s',
    SERIAL,
    'logcat',
    '-v',
    'threadtime',
    '-T',
    '1',
    'ReactNativeJS:V',
    'ReactNative:W',
    'AndroidRuntime:E',
    '*:S',
  ]);
  let buf = '';
  child.stdout.on('data', (chunk) => {
    buf += chunk.toString('utf8');
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const e = parseTblog(line);
      if (e) {
        sink.write(`${JSON.stringify(e)}\n`);
        console.log(fmtEntry(e));
      } else if (/AndroidRuntime|FATAL|ReactNative[^J]/.test(line)) {
        sink.write(`${JSON.stringify({ native: line.trim() })}\n`);
        console.log(`${C.red}${line.trim()}${C.reset}`);
      }
    }
  });
  child.on('exit', () => sink.end());
  process.on('SIGINT', () => {
    child.kill();
    sink.end();
    console.log(`\nSaved ${path.relative(ROOT, file)}`);
    process.exit(0);
  });
}

async function cmdPull() {
  const outDir = path.join(OUT_ROOT, stamp());
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`${C.bold}Pulling logs from ${SERIAL}…${C.reset}`);

  // 1. Ask a dev/release build to re-emit its full report (ignored by Expo Go).
  const dumpOut = adbTry([
    'shell',
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    'travelbuddy://debug/dump',
    PKG,
  ]);
  if (dumpOut && !/Error/.test(dumpOut)) await sleep(2500);

  // 2. logcat
  const logcat = adb(['logcat', '-d', '-v', 'threadtime']);
  const appLines = logcat
    .split('\n')
    .filter((l) =>
      /ReactNativeJS|ReactNative\b|AndroidRuntime|TBLOG|TBDUMP|libc\s+:.*Fatal|FATAL EXCEPTION|expo/i.test(
        l,
      ),
    );
  fs.writeFileSync(path.join(outDir, 'logcat-app.txt'), appLines.join('\n'));

  const entries = new Map();
  for (const l of appLines) {
    const e = parseTblog(l);
    if (e && e.sid && e.seq) entries.set(`${e.sid}#${e.seq}`, e);
  }

  // TBDUMP blocks → full in-app report text
  const dumps = {};
  for (const l of appLines) {
    const m = /TBDUMP (\w+) (\d+) (".*")\s*$/.exec(l);
    if (m) {
      try {
        (dumps[m[1]] = dumps[m[1]] || [])[Number(m[2])] = JSON.parse(m[3]);
      } catch {
        // partial line
      }
    }
  }
  const dumpIds = Object.keys(dumps);
  if (dumpIds.length) {
    const latest = [...dumpIds].sort().pop();
    fs.writeFileSync(path.join(outDir, 'in-app-report.txt'), dumps[latest].join(''));
  }

  // 3. persisted files (debug builds only — run-as needs a debuggable app)
  let pulledFiles = 0;
  const ls = adbTry(['shell', 'run-as', PKG, 'ls', 'files/logs']);
  if (ls && !/not debuggable|unknown package|No such file/i.test(ls)) {
    for (const name of ls.split(/\s+/).filter((n) => n.endsWith('.jsonl'))) {
      const content = adbTry(['exec-out', 'run-as', PKG, 'cat', `files/logs/${name}`]);
      if (!content) continue;
      fs.writeFileSync(path.join(outDir, name), content);
      pulledFiles += 1;
      for (const line of content.split('\n')) {
        try {
          const e = JSON.parse(line);
          if (e.sid && e.seq) entries.set(`${e.sid}#${e.seq}`, e);
        } catch {
          // ignore partial line
        }
      }
    }
  }

  const all = Array.from(entries.values()).sort((a, b) =>
    a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : a.seq - b.seq,
  );
  fs.writeFileSync(
    path.join(outDir, 'entries.jsonl'),
    all.map((e) => JSON.stringify(e)).join('\n'),
  );

  // 4. device info
  const prop = (k) => (adbTry(['shell', 'getprop', k]) || '').trim();
  const pkgInfo = adbTry(['shell', 'dumpsys', 'package', PKG]) || '';
  const versionName = (/versionName=(\S+)/.exec(pkgInfo) || [])[1] || 'not installed (Expo Go?)';
  const device = {
    serial: SERIAL,
    model: `${prop('ro.product.manufacturer')} ${prop('ro.product.model')}`,
    android: `${prop('ro.build.version.release')} (API ${prop('ro.build.version.sdk')})`,
    appVersion: versionName,
    pulledAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'device.json'), JSON.stringify(device, null, 2));

  // 5. report
  const report = buildReport(all, appLines, device, { pulledFiles, dumpIds });
  fs.writeFileSync(path.join(outDir, 'report.md'), report.text);

  console.log(
    `\n${C.bold}Sessions:${C.reset} ${report.sessions}   ${C.bold}Entries:${C.reset} ${all.length}   ` +
      `${C.red}${C.bold}MAJOR: ${report.major.length}${C.reset}   ${C.yellow}MINOR: ${report.minor.length}${C.reset}   ` +
      `native crashes: ${report.crashes.length}`,
  );
  for (const i of report.major.slice(0, 15))
    console.log(
      `  ${C.red}✖ [${i.feature}] ${i.code}${i.key ? ` (${i.key})` : ''} ×${i.count}${C.reset} ${i.message || ''}`,
    );
  for (const i of report.minor.slice(0, 15))
    console.log(
      `  ${C.yellow}• [${i.feature}] ${i.code}${i.key ? ` (${i.key})` : ''} ×${i.count}${C.reset} ${i.message || ''}`,
    );
  if (all.length === 0) {
    console.log(
      `\n${C.yellow}No TBLOG entries found.${C.reset} Is the app running a build with logging? If logcat rotated, run ` +
        `"npm run logs:start" before reproducing, or use the in-app "Send to PC" button and pull again.`,
    );
  }
  console.log(
    `\n${C.green}✔ Saved to ${path.relative(ROOT, outDir)}${C.reset}  (open report.md first)`,
  );
}

function buildReport(all, appLines, device, meta) {
  // Issues: entries emitted by reportIssue() carry `code` + `sev`; the last one per key has the final count.
  const issues = new Map();
  for (const e of all) {
    if (!e.code) continue;
    const key = e.data && e.data.key ? e.data.key : '';
    const id = `${e.sid}|${e.code}|${key}`;
    const prev = issues.get(id);
    issues.set(id, {
      session: e.sid,
      code: e.code,
      key,
      severity: e.sev,
      feature: e.f,
      count: Math.max(prev ? prev.count : 0, (e.data && e.data.count) || 1),
      message: (e.data && e.data.message) || (prev && prev.message) || '',
      detail: (prev && prev.detail) || (e.data && e.data.detail),
      firstSeen: prev ? prev.firstSeen : e.ts,
      lastSeen: e.ts,
    });
  }
  const list = Array.from(issues.values()).sort((a, b) => b.count - a.count);
  const major = list.filter((i) => i.severity === 'major');
  const minor = list.filter((i) => i.severity === 'minor');

  const crashes = appLines.filter((l) =>
    /FATAL EXCEPTION|AndroidRuntime: |Fatal signal|libc\s+:.*Fatal/.test(l),
  );
  const sessions = new Set(all.map((e) => e.sid)).size;
  const byFeature = {};
  for (const e of all) {
    byFeature[e.f] = byFeature[e.f] || { entries: 0, warn: 0, error: 0 };
    byFeature[e.f].entries += 1;
    if (e.lvl === 'warn') byFeature[e.f].warn += 1;
    if (e.lvl === 'error') byFeature[e.f].error += 1;
  }
  const net = all.filter(
    (e) => /^net\./.test(e.ev) && /(ok|failed|http_error|bad_json)$/.test(e.ev),
  );
  const fares = all.filter((e) => e.f === 'FARE' && e.ev === 'fare.computed').slice(-40);
  const startEntries = all.filter((e) => e.ev === 'session.start');

  const issueBlock = (arr) =>
    arr.length === 0
      ? '_none_\n'
      : arr
          .map(
            (i) =>
              `- **[${i.feature}] ${i.code}**${i.key ? ` \`${i.key}\`` : ''} ×${i.count} — ${i.message || ''}\n` +
              `  - first ${i.firstSeen} · last ${i.lastSeen} · session ${i.session}\n` +
              (i.detail ? `  - detail: \`${JSON.stringify(i.detail).slice(0, 400)}\`\n` : ''),
          )
          .join('');

  const text = [
    '# TravelBuddy device log report',
    '',
    `- Device: ${device.model} · Android ${device.android} · serial ${device.serial}`,
    `- App: ${device.appVersion}`,
    `- Pulled: ${device.pulledAt}`,
    `- Sessions: ${sessions} · entries: ${all.length} · persisted files pulled: ${meta.pulledFiles} · in-app dumps: ${meta.dumpIds.length}`,
    ...startEntries.map((e) => `- Session ${e.sid}: ${JSON.stringify(e.data)}`),
    '',
    `## MAJOR issues (${major.length}) — feature broken or wrong info shown`,
    issueBlock(major),
    `## MINOR issues (${minor.length}) — degraded, fallback used, or unverified`,
    issueBlock(minor),
    `## Native crashes (${crashes.length})`,
    crashes.length ? '```\n' + crashes.slice(0, 80).join('\n') + '\n```' : '_none_',
    '',
    '## Per-feature activity',
    '| Feature | Entries | Warn | Error |',
    '|---|---:|---:|---:|',
    ...Object.entries(byFeature).map(
      ([f, c]) => `| ${f} | ${c.entries} | ${c.warn} | ${c.error} |`,
    ),
    '',
    `## Network requests (${net.length})`,
    '| Time | Request | Result | Status | ms |',
    '|---|---|---|---|---:|',
    ...net
      .slice(-80)
      .map(
        (e) =>
          `| ${e.ts.slice(11, 19)} | ${e.ev.replace(/^net\.|\.(ok|failed|http_error|bad_json)$/g, '')} | ${e.ev.split('.').pop()} | ${e.data?.status ?? e.data?.reason ?? ''} | ${e.data?.durationMs ?? ''} |`,
      ),
    '',
    `## Last fares shown (${fares.length})`,
    '| Time | Where | City | Vehicle | Fare | km | Distance source | Night |',
    '|---|---|---|---|---:|---:|---|---|',
    ...fares.map(
      (e) =>
        `| ${e.ts.slice(11, 19)} | ${e.data.where} | ${e.data.cityId} | ${e.data.vehicle} | ${e.data.fare ?? 'app price'} | ${e.data.km} | ${e.data.distanceSource} | ${e.data.night} |`,
    ),
    '',
    '## Warnings & errors timeline',
    '```',
    ...all
      .filter((e) => e.lvl === 'warn' || e.lvl === 'error')
      .slice(-150)
      .map(
        (e) =>
          `${e.ts} ${e.lvl.toUpperCase()} [${e.f}] ${e.ev} ${e.data ? JSON.stringify(e.data).slice(0, 300) : ''}`,
      ),
    '```',
    '',
    'Files: entries.jsonl (all entries, machine readable) · logcat-app.txt (raw) · in-app-report.txt (if a dump was found)',
  ].join('\n');

  return { text, major, minor, crashes, sessions };
}

// ---------------------------------------------------------------- main
(async () => {
  if (cmd === 'start') await cmdStart();
  else if (cmd === 'clear') cmdClear();
  else if (cmd === 'open') cmdOpen();
  else if (cmd === 'live') cmdLive();
  else if (cmd === 'pull') await cmdPull();
  else {
    console.log('Usage: node scripts/logs.js [start|live|pull|open|clear] [--serial <id>]');
    process.exit(1);
  }
})();
