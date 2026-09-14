import React, { useEffect, useState } from 'react';
import { Animated, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';

const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

export default function BengaluruToast({ toast, topInset = 0 }) {
  const [scaleAnim] = useState(() => new Animated.Value(0.7));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (toast) {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast, scaleAnim, opacityAnim]);

  if (!toast) return null;

  const dynamicTop = Math.max(statusBarInset, topInset) + 50;

  return (
    <View pointerEvents="none" style={[styles.container, { top: dynamicTop }]}>
      <Animated.View
        style={[
          styles.pill,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.text}>{toast}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  pill: {
    backgroundColor: colors.neutral[900],
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    ...shadow.md,
  },
  text: {
    color: colors.neutral[100],
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
  },
});
