/**
 * Persists log entries on the device as JSON Lines so a session can be exported
 * even when the phone was not connected to a PC while the problem happened.
 *
 * Location: <app files dir>/logs/tb-<sessionId>.jsonl
 *   Android path: /data/data/app.travelbuddy.companion/files/logs/
 *   (readable with `adb shell run-as app.travelbuddy.companion ...` on debug builds;
 *    scripts/logs.js does this automatically.)
 *
 * Writes are batched (every FLUSH_MS or FLUSH_COUNT entries) to keep disk I/O off
 * the hot path. Only the newest MAX_FILES session files are kept and each is capped
 * at MAX_FILE_BYTES.
 */

const FLUSH_MS = 2000;
const FLUSH_COUNT = 40;
const MAX_FILES = 6;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

let fs = null;
try {
  // Optional at runtime: jest / web fall back to memory-only logging.
  // eslint-disable-next-line global-require
  fs = require('expo-file-system');
} catch {
  fs = null;
}

export function createFileSink(sessionId) {
  if (!fs || !fs.File || !fs.Directory || !fs.Paths) return null;

  let dir;
  let file;
  try {
    dir = new fs.Directory(fs.Paths.document, 'logs');
    dir.create({ intermediates: true, idempotent: true });
    file = new fs.File(dir, `tb-${sessionId}.jsonl`);
    if (!file.exists) file.create();
    pruneOldFiles(dir);
  } catch (err) {
    return { write() {}, flush() {}, error: String(err && err.message) };
  }

  let pending = [];
  let timer = null;
  let disabled = false;

  function flush() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (disabled || pending.length === 0) return;
    const chunk = pending.join('\n') + '\n';
    pending = [];
    try {
      if (file.size > MAX_FILE_BYTES) {
        // Keep the session going in a continuation file instead of growing forever.
        file = new fs.File(dir, `tb-${sessionId}-cont-${Date.now()}.jsonl`);
        file.create();
        pruneOldFiles(dir);
      }
      file.write(chunk, { append: true });
    } catch {
      disabled = true; // Disk full / revoked: stop trying, memory + logcat still work.
    }
  }

  return {
    uri: file.uri,
    directoryUri: dir.uri,
    write(entry) {
      pending.push(JSON.stringify(entry));
      if (pending.length >= FLUSH_COUNT) flush();
      else if (!timer) timer = setTimeout(flush, FLUSH_MS);
    },
    flush,
  };
}

function pruneOldFiles(dir) {
  try {
    const files = dir
      .list()
      .filter((f) => f instanceof fs.File && /^tb-.*\.jsonl$/.test(f.name))
      .sort((a, b) => (a.name < b.name ? 1 : -1));
    files.slice(MAX_FILES).forEach((f) => {
      try {
        f.delete();
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

/** Reads every persisted log file (newest first) — used by the in-app export. */
export function readPersistedLogs() {
  if (!fs || !fs.Directory) return [];
  try {
    const dir = new fs.Directory(fs.Paths.document, 'logs');
    if (!dir.exists) return [];
    return dir
      .list()
      .filter((f) => f instanceof fs.File && /\.jsonl$/.test(f.name))
      .sort((a, b) => (a.name < b.name ? 1 : -1))
      .map((f) => ({ name: f.name, size: f.size, uri: f.uri }));
  } catch {
    return [];
  }
}

export function getFileSystem() {
  return fs;
}
