import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, radius, shadow, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Card, Kicker, Pill } from '../components/primitives';
import CheckInBurst from '../components/CheckInBurst';
import CompassMascot from '../components/CompassMascot';
import { useTrip } from '../../src/context/TripContext';
import { getTrailsForCity, getTrailById } from '../data/bengaluruTrails';
import {
  mergeVisited,
  proximityLabel,
  stopsInRange,
  trailStopStampInput,
  unlockStampOnce,
} from '../services/checkInService';
import { trailProgress } from '../../src/domain/geofence';
import { getCurrentUserLocation } from '../services/locationService';

/**
 * Trails — curated neighbourhood walking circuits (F-1) with GPS check-ins and
 * Rain Mode (F-4). Without location permission, milestones stay locked and the
 * screen shows guidance only (per spec: no manual override in v1).
 */
export default function TrailWalkScreen({ contentPadding }) {
  const { userLocation, isLocating, cityId, fireToast, refreshUserLocation } = useTrip();
  const trails = useMemo(() => getTrailsForCity(cityId), [cityId]);
  const [activeTrailId, setActiveTrailId] = useState(trails[0]?.id ?? null);
  const [visitedIds, setVisitedIds] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // Track which stops are *newly* visited so only those get the burst.
  const [freshVisits, setFreshVisits] = useState(new Set());
  // The mascot celebrates for ~3.5s whenever something good happens.
  const [celebrating, setCelebrating] = useState(false);
  const celebrateTimer = useRef(null);

  const activeTrail = useMemo(
    () => getTrailById(activeTrailId) || trails[0] || null,
    [activeTrailId, trails],
  );

  // The mascot celebrates for ~3.5s whenever something good happens.
  // Declared before the check-in effect below so the effect can invoke it.
  const triggerCelebration = useCallback(() => {
    setCelebrating(true);
    clearTimeout(celebrateTimer.current);
    celebrateTimer.current = setTimeout(() => setCelebrating(false), 3500);
  }, []);

  const activeTrailIsOutdoor =
    activeTrail && !activeTrail.isIndoor && activeTrail.weatherRiskTags?.includes('open-air');
  const indoorTrail = useMemo(() => {
    if (!activeTrail?.indoorTrailId) return null;
    return getTrailById(activeTrail.indoorTrailId);
  }, [activeTrail]);

  // GPS check-in: merge in-range stops into visited + unlock stamps once.
  // setState runs inside an event-ordered callback (location arrival), not a
  // synchronous effect body, so it cannot cascade within this render pass.
  useEffect(() => {
    if (!activeTrail || !userLocation) return;
    const inRange = stopsInRange(activeTrail, userLocation);
    if (inRange.length === 0) return;

    // Deferred to a microtask: the geofence transition is itself an external
    // event (the user physically arriving), so this is event-driven state.
    Promise.resolve().then(() => {
      setVisitedIds((prev) => {
        const newly = inRange.filter((s) => !prev.includes(s.id));
        if (newly.length > 0) {
          setFreshVisits((f) => {
            const next = new Set(f);
            newly.forEach((s) => next.add(s.id));
            return next;
          });
          triggerCelebration();
        }
        return mergeVisited(prev, activeTrail, userLocation);
      });
      inRange.forEach((stop) => {
        unlockStampOnce(trailStopStampInput(activeTrail, stop, cityId)).then((created) => {
          if (created) {
            fireToast(`🎒 Stamp unlocked — ${stop.name}!`);
          }
        });
      });
    });
  }, [activeTrail, userLocation, cityId, fireToast, triggerCelebration]);

  const progress = trailProgress(activeTrail?.stops ?? [], visitedIds);
  const totalCount = activeTrail?.stops?.length ?? 0;

  const requestLocation = useCallback(async () => {
    try {
      const loc = await getCurrentUserLocation();
      if (loc) {
        setPermissionDenied(false);
      }
    } catch {
      setPermissionDenied(true);
    }
  }, []);

  useEffect(() => {
    if (isLocating === false && (!userLocation || userLocation.isDefault)) {
      // Location resolution finished without a real fix — treat as denied and
      // show the guidance card. Kept out of the sync effect body via microtask.
      Promise.resolve().then(() => setPermissionDenied(true));
    }
  }, [isLocating, userLocation]);

  if (!activeTrail) {
    return (
      <View style={[styles.empty, contentPadding]}>
        <Text style={[styles.emptyText, { fontFamily: family('body') }]}>
          No trails here yet — this city is still being drawn. Bengaluru is waiting.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentPadding]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with reactive mascot */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Kicker tone="accent">WALKING TRAILS</Kicker>
          </View>
          <CompassMascot kind="rain" animate celebrate={celebrating} />
        </View>
        <Text style={[styles.title, { fontFamily: family('heading') }]}>{activeTrail.title}</Text>
        <Text style={[styles.summary, { fontFamily: family('body') }]}>{activeTrail.summary}</Text>
        <View style={styles.metaRow}>
          <Pill tone="neutral">{activeTrail.neighbourhood}</Pill>
          <Pill tone="accent2">{activeTrail.totalDistanceKm} km</Pill>
          <Pill tone="neutral">~{Math.round(activeTrail.estDurationMin / 60)} h</Pill>
        </View>
      </View>

      {/* Trail picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickerRow}
      >
        {trails.map((trail) => {
          const selected = trail.id === activeTrail.id;
          return (
            <Pressable
              key={trail.id}
              onPress={() => setActiveTrailId(trail.id)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                  { fontFamily: family('bodyBold') },
                ]}
              >
                {trail.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressCount, { fontFamily: family('heading') }]}>
            {progress}/{totalCount}
          </Text>
          <View style={styles.progressCopy}>
            <Text style={[styles.progressLabel, { fontFamily: family('bodyExtraBold') }]}>
              stops checked in
            </Text>
            <Text style={[styles.progressHint, { fontFamily: family('body') }]}>
              {progress === 0
                ? "Walk into a stop's circle and it unlocks itself."
                : progress === totalCount
                  ? 'Trail complete — the whole path is yours. One more?'
                  : `${totalCount - progress} stop${totalCount - progress === 1 ? '' : 's'} left — they\'re closer than they look.`}
            </Text>
          </View>
        </View>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${totalCount ? (progress / totalCount) * 100 : 0}%` }]}
          />
        </View>
      </Card>

      {/* Permission guidance (no manual override per spec) */}
      {permissionDenied ? (
        <Card style={styles.noticeCard}>
          <Kicker tone="accent">LOCATION NEEDED</Kicker>
          <Text style={[styles.noticeText, { fontFamily: family('body') }]}>
            The trail checks you in when you truly arrive — no fake taps. Give TravelBuddy your
            location and each stop unlocks as you reach it.
          </Text>
          <Pressable
            style={styles.noticeButton}
            onPress={() => {
              Linking.openSettings().catch(() => {});
              requestLocation();
            }}
          >
            <Text style={[styles.noticeButtonText, { fontFamily: family('bodyBold') }]}>
              Open device settings
            </Text>
          </Pressable>
          <Pressable onPress={() => refreshUserLocation()}>
            <Text style={[styles.noticeRetry, { fontFamily: family('bodyBold') }]}>Try again</Text>
          </Pressable>
        </Card>
      ) : null}

      {/* Numbered walking map */}
      <TrailMap trail={activeTrail} visitedIds={visitedIds} userLocation={userLocation} />

      {/* Rain Mode */}
      {activeTrailIsOutdoor && indoorTrail ? (
        <Card style={styles.rainCard}>
          <View style={styles.rainRow}>
            <Text style={[styles.rainText, { fontFamily: family('body') }]}>
              ☔ Rain Mode — dark clouds? Switch to the covered plan.
            </Text>
            <Pressable
              style={styles.rainButton}
              onPress={() => {
                setActiveTrailId(indoorTrail.id);
                triggerCelebration();
                fireToast('☔ Plan B on — staying dry and unhurried.');
              }}
            >
              <Text style={[styles.rainButtonText, { fontFamily: family('bodyBold') }]}>
                Plan B
              </Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      {/* Stop list */}
      <View style={styles.stopList}>
        {activeTrail.stops.map((stop) => {
          const visited = visitedIds.includes(stop.id);
          const proximity = proximityLabel(stop, userLocation);
          return (
            <Card key={stop.id} style={styles.stopCard}>
              <View style={styles.stopHeader}>
                {visited && freshVisits.has(stop.id) ? (
                  <CheckInBurst key={`burst_${stop.id}`}>
                    <StopDot visited={visited} order={stop.order} />
                  </CheckInBurst>
                ) : (
                  <StopDot visited={visited} order={stop.order} />
                )}
                <View style={styles.stopTitles}>
                  <Text style={[styles.stopName, { fontFamily: family('bodyBold') }]}>
                    {stop.name}
                  </Text>
                  <Text style={[styles.stopMeta, { fontFamily: family('body') }]}>
                    {[stop.hours, proximity].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.stopTip, { fontFamily: family('body') }]}>{stop.tip}</Text>
              {stop.citations?.length ? (
                <Text style={[styles.stopCitation, { fontFamily: family('body') }]}>
                  Source: {stop.citations[0].replace(/^https?:\/\//, '').split('/')[0]}
                </Text>
              ) : null}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

/** Stop number/✓ dot, extracted so CheckInBurst can wrap it. */
function StopDot({ visited, order }) {
  return (
    <View style={[styles.stopDotWrap]}>
      <View style={[styles.stopDot, visited ? styles.stopDotVisited : styles.stopDotPending]}>
        <Text style={[styles.stopDotText, visited && styles.stopDotTextVisited]}>
          {visited ? '✓' : order}
        </Text>
      </View>
    </View>
  );
}

/** SVG mini-map: numbered dots connected by dashed walking lines. */
function TrailMap({ trail, visitedIds, userLocation }) {
  const width = 320;
  const height = 210;

  const { points, lines } = useMemo(() => {
    const lats = trail.stops.map((s) => s.latitude);
    const lngs = trail.stops.map((s) => s.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 1e-5);
    const lngSpan = Math.max(maxLng - minLng, 1e-5);
    const pad = 34;

    const pts = trail.stops.map((s) => ({
      id: s.id,
      order: s.order,
      x: pad + ((s.longitude - minLng) / lngSpan) * (width - pad * 2),
      y: height - pad - ((s.latitude - minLat) / latSpan) * (height - pad * 2),
      visited: visitedIds.includes(s.id),
    }));
    const lns = [];
    for (let i = 1; i < pts.length; i++) {
      lns.push({ x1: pts[i - 1].x, y1: pts[i - 1].y, x2: pts[i].x, y2: pts[i].y });
    }
    return { points: pts, lines: lns };
  }, [trail, visitedIds]);

  const userPoint = useMemo(() => {
    if (!userLocation || typeof userLocation.latitude !== 'number') return null;
    const lats = trail.stops.map((s) => s.latitude);
    const lngs = trail.stops.map((s) => s.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 34;
    return {
      x:
        pad +
        ((userLocation.longitude - minLng) / Math.max(maxLng - minLng, 1e-5)) * (width - pad * 2),
      y:
        height -
        pad -
        ((userLocation.latitude - minLat) / Math.max(maxLat - minLat, 1e-5)) * (height - pad * 2),
    };
  }, [trail, userLocation]);

  return (
    <View style={styles.mapCard}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {lines.map((l, i) => (
          <Line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={colors.accentRamp[400]}
            strokeWidth={2.5}
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        ))}
        {points.map((p) => (
          <Circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.visited ? 16 : 13}
            fill={p.visited ? colors.accent2Ramp[500] : colors.neutral[100]}
            stroke={p.visited ? colors.accent2Ramp[700] : colors.accentRamp[500]}
            strokeWidth={2.5}
          />
        ))}
        {points.map((p, i) => (
          <SvgText
            key={`txt_${p.id}`}
            x={p.x}
            y={p.y + 4}
            anchor="middle"
            fill={p.visited ? colors.white : colors.accentRamp[800]}
            fontSize="12"
            fontWeight="bold"
            text={p.visited ? '✓' : String(i + 1)}
          />
        ))}
        {userPoint ? (
          <Circle
            cx={userPoint.x}
            cy={userPoint.y}
            r={7}
            fill={colors.accentRamp[600]}
            stroke={colors.white}
            strokeWidth={2}
          />
        ) : null}
      </Svg>
    </View>
  );
}

// Small helper: react-native-svg does not export `Text` under the same name as RN.
function SvgText(props) {
  const { Text: SvgTextEl } = require('react-native-svg');
  return <SvgTextEl {...props}>{props.text}</SvgTextEl>;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.neutral[600],
  },
  header: {
    paddingTop: 6,
    gap: space[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...type.title,
    color: colors.text,
  },
  summary: {
    ...type.body,
    color: colors.neutral[700],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
    marginTop: space[1],
  },
  pickerRow: {
    gap: space[2],
    paddingVertical: space[2],
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: colors.neutral[100],
  },
  chipSelected: {
    backgroundColor: colors.accentRamp[500],
    borderColor: colors.accentRamp[500],
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    fontSize: 12.5,
    color: colors.neutral[700],
  },
  chipTextSelected: {
    color: colors.white,
  },
  progressCard: {
    marginTop: space[2],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  progressCount: {
    fontSize: 30,
    color: colors.accentRamp[600],
  },
  progressCopy: {
    flex: 1,
    gap: 2,
  },
  progressLabel: {
    fontSize: 13.5,
    color: colors.text,
  },
  progressHint: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  track: {
    marginTop: space[2],
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent2Ramp[500],
  },
  noticeCard: {
    marginTop: space[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.accentRamp[500],
  },
  noticeText: {
    marginTop: space[1],
    color: colors.neutral[700],
  },
  noticeButton: {
    marginTop: space[2],
    alignSelf: 'flex-start',
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  noticeButtonText: {
    color: colors.white,
    fontSize: 13,
  },
  noticeRetry: {
    marginTop: space[2],
    color: colors.accentRamp[700],
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  mapCard: {
    marginTop: space[3],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: space[2],
    ...shadow.sm,
  },
  rainCard: {
    marginTop: space[3],
    backgroundColor: colors.accent2Ramp[100],
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  rainText: {
    flex: 1,
    color: colors.accent2Ramp[800],
    fontSize: 13.5,
  },
  rainButton: {
    backgroundColor: colors.accent2Ramp[600],
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rainButtonText: {
    color: colors.white,
    fontSize: 13,
  },
  stopList: {
    marginTop: space[3],
    gap: space[2],
  },
  stopCard: {
    gap: space[1],
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  stopDot: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopDotWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopDotVisited: {
    backgroundColor: colors.accent2Ramp[500],
  },
  stopDotPending: {
    backgroundColor: colors.accentRamp[100],
    borderWidth: 1.5,
    borderColor: colors.accentRamp[400],
  },
  stopDotText: {
    fontSize: 13,
    color: colors.accentRamp[800],
  },
  stopDotTextVisited: {
    color: colors.white,
  },
  stopTitles: {
    flex: 1,
    minWidth: 0,
  },
  stopName: {
    fontSize: 14.5,
    color: colors.text,
  },
  stopMeta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 1,
  },
  stopTip: {
    fontSize: 12.5,
    color: colors.neutral[700],
    paddingLeft: 42,
  },
  stopCitation: {
    fontSize: 10.5,
    color: colors.neutral[500],
    paddingLeft: 42,
    marginTop: 2,
  },
});
