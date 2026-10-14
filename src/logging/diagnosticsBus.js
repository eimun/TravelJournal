/** Tiny pub/sub so any screen (or a deep link) can open the Diagnostics screen. */
const listeners = new Set();

export function openDiagnostics(source = 'unknown') {
  listeners.forEach((fn) => fn(true, source));
}

export function closeDiagnostics() {
  listeners.forEach((fn) => fn(false));
}

export function onDiagnosticsToggle(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
