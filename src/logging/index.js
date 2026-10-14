/**
 * Logging entry point. Call setupLogging() once, before the app renders.
 * See docs/LOGGING.md for how to pull logs to a PC.
 */

import { Linking, Platform } from 'react-native';
import { addSink, FEATURES, getSessionInfo, log, setLogContext } from './logger';
import { createFileSink } from './fileSink';
import { installGlobalHandlers } from './globalHandlers';
import { dumpLogsToLogcat, setAppMeta } from './report';
import { openDiagnostics } from './diagnosticsBus';

export * from './logger';
export { openDiagnostics } from './diagnosticsBus';
export { SEVERITY, ISSUE_CATALOG } from './issueCatalog';
export { loggedFetch } from './loggedFetch';
export { buildReport, shareLogs, dumpLogsToLogcat } from './report';

let fileSink = null;
let ready = false;

export function setupLogging({ appVersion, runtime } = {}) {
  if (ready) return;
  ready = true;
  const { sessionId } = getSessionInfo();

  installGlobalHandlers({
    onFatal: () => fileSink && fileSink.flush(),
  });

  fileSink = createFileSink(sessionId);
  if (fileSink && fileSink.write) addSink(fileSink);

  setAppMeta({
    app: `TravelBuddy ${appVersion || ''}`.trim(),
    runtime: runtime || 'unknown',
    logFile: fileSink && fileSink.uri ? fileSink.uri : 'memory only',
  });

  log.info(FEATURES.APP, 'session.start', {
    platform: Platform.OS,
    osVersion: Platform.Version,
    appVersion,
    runtime,
    logFile: fileSink ? fileSink.uri || fileSink.error : 'unavailable',
  });

  // travelbuddy://debug       → open the Diagnostics screen
  // travelbuddy://debug/dump  → re-emit the full report to logcat (used by scripts/logs.js)
  const handleUrl = (url) => {
    if (!url) return;
    if (/:\/\/debug\/dump/.test(url)) {
      log.info(FEATURES.APP, 'debug.dump_requested', { url });
      if (fileSink) fileSink.flush();
      dumpLogsToLogcat();
    } else if (/:\/\/debug\/?$/.test(url)) {
      openDiagnostics('deep_link');
    }
  };
  Linking.getInitialURL()
    .then(handleUrl)
    .catch(() => {});
  Linking.addEventListener('url', ({ url }) => handleUrl(url));
}

export function flushLogs() {
  if (fileSink) fileSink.flush();
}

export function setScreen(screen) {
  setLogContext({ screen });
  log.info(FEATURES.UI, 'screen.view', { screen });
}
