import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { reportIssue, serializeError } from './logger';
import { openDiagnostics } from './diagnosticsBus';

/**
 * Catches render errors in a screen, logs them as APP_RENDER_CRASH (MAJOR) with the
 * component stack, and shows a recovery panel instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportIssue('APP_RENDER_CRASH', {
      key: `${this.props.name || 'screen'}:${String(error && error.message).slice(0, 60)}`,
      message: error && error.message,
      data: {
        screen: this.props.name,
        error: serializeError(error),
        componentStack:
          info && info.componentStack
            ? info.componentStack.split('\n').slice(0, 12).join('\n')
            : null,
      },
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.box}>
        <Text style={styles.title}>This screen hit an error</Text>
        <Text style={styles.msg}>{String(this.state.error && this.state.error.message)}</Text>
        <Text style={styles.msg}>It has been saved to the diagnostics log.</Text>
        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => openDiagnostics('error_boundary')}>
            <Text style={styles.btnText}>Open logs</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#202124' },
  msg: { fontSize: 13, color: '#5f6368', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: {
    backgroundColor: '#22aa48',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
