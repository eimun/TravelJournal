import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { nextCondition, readingFor, seedChecklist } from '../domain/weather';
import { trip } from '../../app/data/sampleTrip';

const TripContext = createContext(null);

/**
 * The clock the fixture runs against — 12:18, which puts the 13:30 stop about an
 * hour out. The real build reads the device clock; this keeps the demo showing a
 * live countdown that matches the design.
 */
const FIXTURE_START_MINUTES = 12 * 60 + 18;

/**
 * One trip's live state, shared by every tab.
 *
 * This stands in for the Session / ActiveTrip providers in PRD 4.3 until the
 * repository layer lands: screens read from here, never from each other, so
 * cycling the weather on Home re-derives the packing quest on Trail and the
 * flag on the trail stones without any screen knowing about the others.
 */
export function TripProvider({ children }) {
  const [tab, setTab] = useState('home');
  const [condition, setCondition] = useState('rain');
  const [minutes, setMinutes] = useState(FIXTURE_START_MINUTES);
  const [packing, setPacking] = useState(() => seedChecklist('rain'));
  const [xp, setXp] = useState(340);
  const [memories, setMemories] = useState(14);
  const [snoozed, setSnoozed] = useState(false);
  const [openDay, setOpenDay] = useState(null);
  const [dayFilter, setDayFilter] = useState(3);
  const [savedPin, setSavedPin] = useState(false);
  const [settings, setSettings] = useState([true, true, false, true]);
  const [toast, setToast] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const celebrateTimer = useRef(null);

  useEffect(() => {
    const tick = setInterval(() => setMinutes((m) => m + 1 / 60), 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(celebrateTimer.current);
    };
  }, []);

  const reward = useCallback((text, points = 0) => {
    setToast({ text, at: Date.now() });
    if (points) setXp((value) => value + points);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /** A new forecast is a new quest: the canvas re-seeds the bag at 2 of 5. */
  const cycleWeather = useCallback(() => {
    const next = nextCondition(condition);
    setCondition(next);
    setPacking(seedChecklist(next));
  }, [condition]);

  const togglePacking = useCallback(
    (target) => {
      const updated = packing.map((item) =>
        item.id === target.id ? { ...item, done: !item.done } : item,
      );
      setPacking(updated);

      if (!target.done) {
        reward('+10 XP', 10);
        if (updated.every((item) => item.done)) {
          reward('Bag packed · +40 XP', 40);
          setCelebrating(true);
          clearTimeout(celebrateTimer.current);
          celebrateTimer.current = setTimeout(() => setCelebrating(false), 2600);
        }
      }
    },
    [packing, reward],
  );

  /** Snoozing pushes the reminder out; the countdown shows it, no toast needed. */
  const snooze = useCallback(() => setSnoozed(true), []);

  const savePlace = useCallback(() => {
    if (savedPin) return;
    setSavedPin(true);
    reward('+15 XP', 15);
  }, [savedPin, reward]);

  const addMemory = useCallback(() => {
    setMemories((count) => count + 1);
    reward('Memory kept', 5);
  }, [reward]);

  const toggleSetting = useCallback((index) => {
    setSettings((current) => current.map((on, i) => (i === index ? !on : on)));
  }, []);

  const reading = readingFor(condition);
  const packedCount = packing.filter((item) => item.done).length;

  const value = useMemo(
    () => ({
      trip,
      tab,
      setTab,
      condition,
      reading,
      cycleWeather,
      minutes,
      packing,
      packedCount,
      togglePacking,
      xp,
      memories,
      addMemory,
      snoozed,
      snooze,
      openDay,
      setOpenDay,
      dayFilter,
      setDayFilter,
      savedPin,
      savePlace,
      settings,
      toggleSetting,
      toast,
      clearToast,
      reward,
      celebrating,
    }),
    [
      tab,
      condition,
      reading,
      cycleWeather,
      minutes,
      packing,
      packedCount,
      togglePacking,
      xp,
      memories,
      addMemory,
      snoozed,
      snooze,
      openDay,
      dayFilter,
      savedPin,
      savePlace,
      settings,
      toggleSetting,
      toast,
      clearToast,
      reward,
      celebrating,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const value = useContext(TripContext);
  if (!value) throw new Error('useTrip must be used inside a TripProvider');
  return value;
}

export default TripContext;
