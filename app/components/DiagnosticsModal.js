import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius } from '../theme/tokens';
import {
  clearLogs,
  dumpLogsToLogcat,
  FEATURES,
  flushLogs,
  getEntries,
  getIssues,
  getSessionInfo,
  log,
  SEVERITY,
  shareLogs,
  subscribe,
} from '../../src/logging';
import { onDiagnosticsToggle } from '../../src/logging/diagnosticsBus';
import { readPersistedLogs } from '../../src/logging/fileSink';
import { VERIFICATION_META } from '../services/restaurantAudit';

const TABS = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'log', label: 'Live log' },
];
const LEVEL_COLORS = { debug: '#94a3b8', info: '#2563eb', warn: '#b45309', error: '#b91c1c' };

/**
 * Diagnostics screen: MAJOR / MINOR issues, live log, and export actions.
 * Open it from the Guide tab ("🐞 Logs"), by long-pressing the Guide tab,
 * or with `adb shell am start -d travelbuddy://debug` on a dev build.
 */
export default function DiagnosticsModal() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState('major');
  const [featureFilter, setFeatureFilter] = useState(null);
  const [tick, setTick] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(
    () =>
      onDiagnosticsToggle((open, source) => {
        setVisible(open);
        if (open) log.info(FEATURES.APP, 'diagnostics.open', { source });
      }),
    [],
  );

  // Re-render on new log entries while open (throttled to 2/s).
  useEffect(() => {
    if (!visible) return undefined;
    let pending = false;
    const unsub = subscribe(() => {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        setTick((t) => t + 1);
      }, 500);
    });
    return unsub;
  }, [visible]);

  const data = useMemo(() => {
    if (!visible) return null;
    return {
      session: getSessionInfo(),
      major: getIssues({ severity: SEVERITY.MAJOR }),
      minor: getIssues({ severity: SEVERITY.MINOR }),
      entries: getEntries({ limit: 300, feature: featureFilter || undefined })
        .slice()
        .reverse(),
      files: readPersistedLogs(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, tick, featureFilter]);

  if (!visible || !data) return null;

  const close = () => setVisible(false);
  const run = async (label, fn) => {
    try {
      setStatus(`${label}…`);
      const res = await fn();
      setStatus(`${label}: done${res && res.chunks ? ` (${res.chunks} chunks)` : ''}`);
    } catch (err) {
      setStatus(`${label} failed: ${err && err.message}`);
      log.warn(FEATURES.APP, 'diagnostics.action_failed', {
        label,
        error: String(err && err.message),
      });
    }
  };

  const issues = tab === 'major' ? data.major : data.minor;
  const featuresInUse = Array.from(new Set(getEntries().map((e) => e.f))).sort();

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 20000 }] }
      : { visible: true, animationType: 'slide', onRequestClose: close };

  return (
    <Container {...containerProps}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>🐞 Diagnostics</Text>
            <Text style={styles.sub} numberOfLines={1}>
              Session {data.session.sessionId} · {data.session.entries} entries
            </Text>
          </View>
          <Pressable onPress={close} style={styles.closeBtn} hitSlop={10}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: '#fdecea' }]}>
            <Text style={[styles.summaryNum, { color: '#b91c1c' }]}>{data.major.length}</Text>
            <Text style={styles.summaryLabel}>MAJOR</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fff7ed' }]}>
            <Text style={[styles.summaryNum, { color: '#b45309' }]}>{data.minor.length}</Text>
            <Text style={styles.summaryLabel}>MINOR</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#eff6ff' }]}>
            <Text style={[styles.summaryNum, { color: '#1d4ed8' }]}>{data.files.length}</Text>
            <Text style={styles.summaryLabel}>LOG FILES</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={() =>
              run('Share', () => {
                flushLogs();
                return shareLogs();
              })
            }
          >
            <Text style={[styles.actionText, { color: '#fff' }]}>Share report</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              run('Sent to PC (logcat)', async () => {
                flushLogs();
                return dumpLogsToLogcat();
              })
            }
          >
            <Text style={styles.actionText}>Send to PC</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              clearLogs();
              setStatus('Cleared in-memory logs (files kept)');
              setTick((t) => t + 1);
            }}
          >
            <Text style={styles.actionText}>Clear</Text>
          </Pressable>
        </View>
        {!!status && <Text style={styles.status}>{status}</Text>}

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, tab === t.id && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                {t.label}
                {t.id === 'major'
                  ? ` (${data.major.length})`
                  : t.id === 'minor'
                    ? ` (${data.minor.length})`
                    : ''}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'log' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[null, ...featuresInUse].map((f) => (
              <Pressable
                key={f || 'all'}
                onPress={() => setFeatureFilter(f)}
                style={[styles.filterChip, featureFilter === f && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, featureFilter === f && { color: '#fff' }]}>
                  {f || 'ALL'}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list}>
          {tab !== 'log' &&
            (issues.length === 0 ? (
              <Text style={styles.empty}>No {tab} issues in this session. 🎉</Text>
            ) : (
              issues.map((i) => (
                <View
                  key={i.id}
                  style={[
                    styles.issue,
                    { borderLeftColor: i.severity === 'major' ? '#dc2626' : '#f59e0b' },
                  ]}
                >
                  <View style={styles.issueTop}>
                    <Text style={styles.issueFeature}>{i.feature}</Text>
                    <Text style={styles.issueCount}>×{i.count}</Text>
                  </View>
                  <Text style={styles.issueTitle}>{i.title}</Text>
                  {!!i.message && <Text style={styles.issueMsg}>{i.message}</Text>}
                  <Text style={styles.issueCode}>
                    {i.code}
                    {i.key ? ` · ${i.key}` : ''} · last {i.lastSeen.slice(11, 19)}
                  </Text>
                  <Text style={styles.issueHint}>Fix hint: {i.hint}</Text>
                </View>
              ))
            ))}

          {tab === 'log' &&
            data.entries.map((e) => (
              <View key={e.seq} style={styles.logRow}>
                <Text style={[styles.logLevel, { color: LEVEL_COLORS[e.lvl] }]}>
                  {e.ts.slice(11, 19)} {e.lvl.toUpperCase()} [{e.f}]
                </Text>
                <Text style={styles.logEvent}>{e.ev}</Text>
                {e.data !== undefined && (
                  <Text style={styles.logData} numberOfLines={4}>
                    {JSON.stringify(e.data)}
                  </Text>
                )}
              </View>
            ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Restaurant data check:{' '}
              {VERIFICATION_META.generatedAt ? VERIFICATION_META.generatedAt.slice(0, 10) : 'never'}{' '}
              · {JSON.stringify(VERIFICATION_META.summary)}
            </Text>
            <Text style={styles.footerText}>On PC: npm run logs:pull (see docs/LOGGING.md)</Text>
          </View>
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? 36 : 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bodyExtraBold,
    color: colors.neutral[900],
  },
  sub: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  closeBtn: {
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeText: {
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 22,
    fontFamily: fontFamily.bodyExtraBold,
  },
  summaryLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
    letterSpacing: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.accentRamp[600],
    borderColor: colors.accentRamp[600],
  },
  actionText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  status: {
    paddingHorizontal: 16,
    marginTop: 6,
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.neutral[900],
  },
  filterRow: {
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: colors.neutral[800],
    borderColor: colors.neutral[800],
  },
  filterText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  list: {
    padding: 16,
    gap: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
  },
  issue: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 10,
    gap: 2,
  },
  issueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  issueFeature: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    letterSpacing: 0.6,
  },
  issueCount: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  issueTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  issueMsg: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
  },
  issueCode: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
    color: colors.neutral[500],
  },
  issueHint: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: '#1d4ed8',
  },
  logRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  logLevel: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  logEvent: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  logData: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
    color: colors.neutral[600],
  },
  footer: {
    marginTop: 14,
    gap: 4,
  },
  footerText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
