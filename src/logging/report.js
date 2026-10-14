/**
 * Builds the human-readable diagnostics report (MAJOR issues first, then MINOR,
 * then recent errors and a log tail) and exports it:
 *   - shareLogs(): Android share sheet (WhatsApp, Gmail, Drive, Nearby Share…)
 *   - dumpLogsToLogcat(): re-emits the report + all buffered entries to logcat
 *     between TBDUMP markers so `npm run logs:pull` can rebuild it on the PC.
 */

import { Platform } from 'react-native';
import { SEVERITY } from './issueCatalog';
import { getEntries, getIssues, getSessionInfo, LEVELS } from './logger';
import { getFileSystem, readPersistedLogs } from './fileSink';

let appMeta = {};
export function setAppMeta(meta) {
  appMeta = { ...appMeta, ...meta };
}

function issueLines(issues) {
  if (issues.length === 0) return ['  (none)'];
  return issues.map(
    (i) =>
      `  • [${i.feature}] ${i.code}${i.key ? ` (${i.key})` : ''} ×${i.count}\n` +
      `      ${i.title}${i.message ? ` — ${i.message}` : ''}\n` +
      `      first ${i.firstSeen} · last ${i.lastSeen}\n` +
      `      fix hint: ${i.hint}`,
  );
}

export function buildReport({ tail = 150 } = {}) {
  const session = getSessionInfo();
  const major = getIssues({ severity: SEVERITY.MAJOR });
  const minor = getIssues({ severity: SEVERITY.MINOR });
  const errors = getEntries({ minLevel: 'warn' }).slice(-60);
  const recent = getEntries({ limit: tail });

  const byFeature = {};
  for (const i of [...major, ...minor]) {
    byFeature[i.feature] = byFeature[i.feature] || { major: 0, minor: 0 };
    byFeature[i.feature][i.severity] += 1;
  }

  const lines = [
    '==== TravelBuddy diagnostics report ====',
    `generated: ${new Date().toISOString()}`,
    `session:   ${session.sessionId} (started ${session.startedAt}, ${session.entries} entries)`,
    `platform:  ${Platform.OS} ${Platform.Version}`,
    ...Object.entries(appMeta).map(([k, v]) => `${k.padEnd(10)} ${v}`),
    `context:   ${JSON.stringify(session.context)}`,
    '',
    `SUMMARY: ${major.length} MAJOR issue(s), ${minor.length} MINOR issue(s)`,
    ...Object.entries(byFeature).map(
      ([f, c]) => `  ${f.padEnd(9)} major ${c.major}  minor ${c.minor}`,
    ),
    '',
    '---- MAJOR (feature broken or wrong info shown) ----',
    ...issueLines(major),
    '',
    '---- MINOR (degraded / fallback / unverified) ----',
    ...issueLines(minor),
    '',
    '---- Recent warnings & errors ----',
    ...errors.map(
      (e) =>
        `${e.ts} ${e.lvl.toUpperCase().padEnd(5)} [${e.f}] ${e.ev} ${e.data ? JSON.stringify(e.data).slice(0, 400) : ''}`,
    ),
    '',
    `---- Last ${recent.length} log entries ----`,
    ...recent.map(
      (e) =>
        `${e.ts} ${e.lvl.padEnd(5)} [${e.f}] ${e.ev} ${e.data ? JSON.stringify(e.data).slice(0, 300) : ''}`,
    ),
    '',
    '---- Raw JSON (machine readable, one entry per line) ----',
    ...getEntries().map((e) => JSON.stringify(e)),
  ];
  return lines.join('\n');
}

export async function shareLogs() {
  const report = buildReport();
  const fs = getFileSystem();
  let Sharing = null;
  try {
    // eslint-disable-next-line global-require
    Sharing = require('expo-sharing');
  } catch {
    Sharing = null;
  }

  if (fs && Sharing && (await Sharing.isAvailableAsync())) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = new fs.File(fs.Paths.cache, `travelbuddy-diagnostics-${stamp}.txt`);
    file.create();
    file.write(report);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/plain',
      dialogTitle: 'Share TravelBuddy diagnostics',
    });
    return { method: 'file', uri: file.uri };
  }

  // Fallback: share as plain text (size-limited by Android intents, so trim the raw part).
  // eslint-disable-next-line global-require
  const { Share } = require('react-native');
  await Share.share({ message: report.slice(0, 90000), title: 'TravelBuddy diagnostics' });
  return { method: 'text' };
}

// Each logcat line must stay below ~4 KB, so the report is sent in chunks.
const DUMP_CHUNK = 3000;

export function dumpLogsToLogcat() {
  const report = buildReport({ tail: 400 });
  const id = Date.now().toString(36);
  const total = Math.ceil(report.length / DUMP_CHUNK);
  console.log(`TBDUMP BEGIN ${id} ${total}`);
  for (let i = 0; i < total; i += 1) {
    console.log(
      `TBDUMP ${id} ${i} ${JSON.stringify(report.slice(i * DUMP_CHUNK, (i + 1) * DUMP_CHUNK))}`,
    );
  }
  console.log(`TBDUMP END ${id}`);
  return { id, chunks: total, persistedFiles: readPersistedLogs() };
}

export { LEVELS };
