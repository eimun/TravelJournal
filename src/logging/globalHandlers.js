/**
 * Captures failures that never reach a try/catch:
 *   - uncaught JS exceptions (ErrorUtils global handler — RN's red screen / crash path)
 *   - unhandled promise rejections (Hermes rejection tracker)
 *   - console.error / console.warn calls from React and libraries
 * The original behaviour is always preserved (handlers are chained, not replaced).
 */

import { FEATURES, log, reportIssue, serializeError } from './logger';

let installed = false;

export function installGlobalHandlers({ onFatal } = {}) {
  if (installed) return;
  installed = true;

  const EU = global.ErrorUtils;
  if (EU && typeof EU.getGlobalHandler === 'function') {
    const previous = EU.getGlobalHandler();
    EU.setGlobalHandler((error, isFatal) => {
      reportIssue('APP_JS_CRASH', {
        key: (error && error.message ? String(error.message) : 'unknown').slice(0, 80),
        message: error && error.message,
        data: { isFatal: !!isFatal, error: serializeError(error) },
      });
      if (onFatal) {
        try {
          onFatal(error, isFatal);
        } catch {
          // ignore
        }
      }
      if (previous) previous(error, isFatal);
    });
  }

  const hermes = global.HermesInternal;
  if (hermes && typeof hermes.enablePromiseRejectionTracker === 'function') {
    try {
      hermes.enablePromiseRejectionTracker({
        allRejections: true,
        onUnhandled: (id, rejection) => {
          reportIssue('APP_UNHANDLED_PROMISE', {
            key: (rejection && rejection.message
              ? String(rejection.message)
              : String(rejection)
            ).slice(0, 80),
            message: rejection && rejection.message ? rejection.message : String(rejection),
            data: { id, error: serializeError(rejection) },
          });
        },
        onHandled: (id) => log.debug(FEATURES.APP, 'promise.rejection_handled_late', { id }),
      });
    } catch {
      // Tracker not available in this runtime.
    }
  }

  const origError = console.error;
  const origWarn = console.warn;
  console.error = (...args) => {
    const message = args.map(stringifyArg).join(' ').slice(0, 1000);
    reportIssue('APP_CONSOLE_ERROR', { key: message.slice(0, 80), message });
    origError.apply(console, args);
  };
  console.warn = (...args) => {
    log.warn(FEATURES.APP, 'console.warn', {
      message: args.map(stringifyArg).join(' ').slice(0, 1000),
    });
    origWarn.apply(console, args);
  };
}

function stringifyArg(a) {
  if (a instanceof Error) return `${a.name}: ${a.message}`;
  if (typeof a === 'string') return a;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
}
