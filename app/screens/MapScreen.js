import { useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import { ChunkyButton } from '../components/Chunky';
import Icon from '../components/Icon';
import { FadeIn, useLoop } from '../components/motion';
import { useTrip } from '../../src/context/TripContext';
import { mapPins, searchResult } from '../data/sampleTrip';

/**
 * A cached map tile stand-in: a quiet, warm city plan — roads, a river, parks —
 * until `feat/F-04-map-places` swaps in react-native-maps. Drawn rather than
 * blank so the pins sit on something that reads as a place.
 */
function CachedTiles({ width: w, height: h }) {
  if (!w || !h) return null;
  const road = colors.neutral[100];
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={w} height={h} fill={colors.neutral[200]} />
      <Ellipse
        cx={w * 0.14}
        cy={h * 0.74}
        rx={w * 0.3}
        ry={h * 0.13}
        fill={colors.accent2Ramp[200]}
      />
      <Ellipse
        cx={w * 0.9}
        cy={h * 0.2}
        rx={w * 0.24}
        ry={h * 0.09}
        fill={colors.accent2Ramp[200]}
      />
      <Path
        d={`M-30 ${h * 0.37} C ${w * 0.3} ${h * 0.27}, ${w * 0.55} ${h * 0.63}, ${w + 30} ${h * 0.55}`}
        stroke={colors.accent2Ramp[300]}
        strokeWidth={26}
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
      <Path d={`M0 ${h * 0.2} L${w} ${h * 0.26}`} stroke={road} strokeWidth={9} />
      <Path d={`M${w * 0.55} 0 L${w * 0.44} ${h}`} stroke={road} strokeWidth={9} />
      <Path d={`M0 ${h * 0.86} L${w} ${h * 0.8}`} stroke={road} strokeWidth={9} />
      <Path d={`M${w * 0.2} 0 L${w * 0.26} ${h}`} stroke={road} strokeWidth={4} />
      <Path d={`M${w * 0.8} 0 L${w * 0.76} ${h}`} stroke={road} strokeWidth={4} />
      <Path d={`M0 ${h * 0.5} L${w} ${h * 0.46}`} stroke={road} strokeWidth={4} />
    </Svg>
  );
}

/** A pin on the map, hopping on its own rhythm (`tj-hop`, 2.2 s + 0.35 s each). */
function MapPin({ pin, index, area }) {
  const hop = useLoop(2200 + index * 350);
  const translateY = hop.interpolate({
    inputRange: [0, 0.3, 0.55, 0.7, 1],
    outputRange: [0, -9, 0, -3, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pin,
        { left: area.w * pin.x, top: area.h * pin.y, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.pinHead,
          { backgroundColor: pin.sage ? colors.accent2Ramp[500] : colors.accentRamp[500] },
        ]}
      />
      <View style={styles.pinTail} />
    </Animated.View>
  );
}

/**
 * Map and saved places — US-007, US-008 — as the canvas lays it out: the map
 * fills the screen, the search and day filter float at the top, and the place
 * card floats at the bottom. Everything here works with no connection.
 */
export default function MapScreen({ contentPadding }) {
  const { dayFilter, setDayFilter, savedPin, savePlace } = useTrip();
  const [area, setArea] = useState({ w: 0, h: 0 });
  const top = (contentPadding?.paddingTop ?? 0) + 2;

  return (
    <FadeIn>
      <View
        style={styles.fill}
        onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <CachedTiles width={area.w} height={area.h} />

        {area.w
          ? mapPins.map((pin, i) => <MapPin key={pin.id} pin={pin} index={i} area={area} />)
          : null}

        <View style={[styles.overlay, { top }]} pointerEvents="box-none">
          <View style={styles.search}>
            <Icon name="search" size={17} color={colors.neutral[600]} />
            <Text style={[styles.searchText, { fontFamily: family('body') }]}>
              Search a place to save
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {[1, 2, 3, 4, 5].map((day) => {
              const selected = day === dayFilter;
              return (
                <ChunkyButton
                  key={day}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Show day ${day}`}
                  onPress={() => setDayFilter(day)}
                  depth={3}
                  depthColor="rgba(46,43,37,0.18)"
                  innerStyle={[
                    styles.chip,
                    { backgroundColor: selected ? colors.accentRamp[500] : colors.white },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected ? colors.white : colors.neutral[700],
                        fontFamily: family('bodyBold'),
                      },
                    ]}
                  >
                    {`Day ${day}`}
                  </Text>
                </ChunkyButton>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.callout}>
          <View style={styles.calloutIcon}>
            <Icon name="pin" size={20} color={colors.accentRamp[700]} />
          </View>

          <View style={styles.calloutCopy}>
            <Text
              numberOfLines={1}
              style={[styles.calloutTitle, { fontFamily: family('bodyBold') }]}
            >
              {savedPin ? `Saved to day ${dayFilter}` : searchResult.name}
            </Text>
            <Text numberOfLines={1} style={[styles.calloutMeta, { fontFamily: family('body') }]}>
              {savedPin ? 'Pinned, works offline' : searchResult.meta}
            </Text>
          </View>

          <ChunkyButton
            accessibilityRole="button"
            accessibilityLabel={savedPin ? 'Place already saved' : 'Save this place'}
            onPress={savePlace}
            depth={4}
            depthColor={colors.accentRamp[700]}
            innerStyle={styles.save}
          >
            <Text style={[styles.saveText, { fontFamily: family('bodyBold') }]}>
              {savedPin ? 'Saved' : 'Save'}
            </Text>
          </ChunkyButton>
        </View>
      </View>
    </FadeIn>
  );
}

const PIN_HEAD = 26;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinHead: {
    width: PIN_HEAD,
    height: PIN_HEAD,
    borderRadius: PIN_HEAD / 2,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.md,
  },
  pinTail: {
    width: 3,
    height: 12,
    backgroundColor: colors.white,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 9,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    ...shadow.md,
  },
  searchText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  chips: {
    gap: 7,
    paddingBottom: 2,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 12.5,
  },
  callout: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
    ...shadow.lg,
  },
  calloutIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentRamp[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCopy: {
    flex: 1,
    minWidth: 0,
  },
  calloutTitle: {
    fontSize: 14.5,
    color: colors.text,
  },
  calloutMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 3,
  },
  save: {
    backgroundColor: colors.accentRamp[500],
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  saveText: {
    fontSize: 13.5,
    color: colors.white,
  },
});
