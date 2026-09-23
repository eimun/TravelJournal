import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PLACES, EATERIES_DB, RESTAURANTS } from '../../app/data/bengaluruData';
import { getDistanceBetween } from '../../app/data/transitData';
import { POPULAR_DESTINATIONS } from '../../app/data/transitData';
import { getCurrentUserLocation, DEFAULT_BENGALURU_LOCATION } from '../../app/services/locationService';
import { planTransitRoute, enrichRouteWithRealRoads } from '../../app/services/directionsService';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  // Navigation tabs: 'navigate' | 'explore' | 'guide' (with 'eat' & 'offline' aliased to 'guide')
  const [tab, setTabState] = useState('navigate');
  const [budget, setBudget] = useState(1200);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [addedPlaces, setAddedPlaces] = useState([]);

  // Live Location & Routing state
  const [userLocation, setUserLocation] = useState(DEFAULT_BENGALURU_LOCATION);
  const [isLocating, setIsLocating] = useState(true);
  const [destination, setDestination] = useState(POPULAR_DESTINATIONS[0]); // default to Cubbon Park
  const [recentSearches, setRecentSearches] = useState([
    POPULAR_DESTINATIONS[0],
    POPULAR_DESTINATIONS[1],
    POPULAR_DESTINATIONS[2],
  ]);

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState('destination'); // 'destination' | 'origin'

  const openSearch = useCallback((target = 'destination') => {
    setSearchTarget(target);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Food / Explore tab state
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all'); // 'all' | 'veg' | 'nonveg' | 'halal' | 'jain'
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [visitedRestaurants, setVisitedRestaurants] = useState([]);

  // Eat / Guide tab state
  const [dish, setDish] = useState('benne');
  const [diets, setDiets] = useState([]);

  // Offline tab state
  const [packStatus, setPackStatus] = useState('idle');
  const [packPct, setPackPct] = useState(0);

  // Toast alert state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const dlInterval = useRef(null);

  // Normalize setTab to support backwards-compatible names
  const setTab = useCallback((nextTab) => {
    if (nextTab === 'eat' || nextTab === 'offline') {
      setTabState('guide');
    } else {
      setTabState(nextTab);
    }
  }, []);

  // Initialize live GPS location on app start
  useEffect(() => {
    let mounted = true;
    async function initLocation() {
      try {
        setIsLocating(true);
        const loc = await getCurrentUserLocation();
        if (mounted) {
          setUserLocation(loc);
          setIsLocating(false);
        }
      } catch {
        if (mounted) setIsLocating(false);
      }
    }
    initLocation();
    return () => {
      mounted = false;
    };
  }, []);

  const [activeStepIndex, setActiveStepIndex] = useState(null);
  const [enrichedRoute, setEnrichedRoute] = useState(null);

  // Compute baseline transit route whenever userLocation or destination changes
  const baseRoute = useMemo(() => {
    if (!userLocation || !destination) return null;
    return planTransitRoute(userLocation, destination);
  }, [userLocation, destination]);

  // Asynchronously fetch real street road geometry and update route
  useEffect(() => {
    let cancelled = false;
    if (!baseRoute) {
      return;
    }

    enrichRouteWithRealRoads(baseRoute).then((roadRoute) => {
      if (!cancelled && roadRoute) {
        setEnrichedRoute(roadRoute);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [baseRoute]);

  const activeRoute = enrichedRoute || baseRoute;

  const refreshUserLocation = useCallback(async () => {
    setIsLocating(true);
    const loc = await getCurrentUserLocation();
    setUserLocation(loc);
    setIsLocating(false);
  }, []);

  const selectDestination = useCallback((dest) => {
    setDestination(dest);
    setRecentSearches((prev) => {
      const filtered = prev.filter((d) => d.id !== dest.id);
      return [dest, ...filtered].slice(0, 6);
    });
  }, []);

  const changeUserLocation = useCallback((newLoc) => {
    setUserLocation(newLoc);
  }, []);

  const swapOriginDestination = useCallback(() => {
    if (!userLocation || !destination) return;
    const oldOrigin = { ...userLocation };
    const oldDest = { ...destination };
    setUserLocation({
      latitude: oldDest.latitude,
      longitude: oldDest.longitude,
      name: oldDest.name,
      isDefault: false,
    });
    setDestination({
      id: `dest_${Date.now()}`,
      name: oldOrigin.name,
      area: 'Bengaluru',
      latitude: oldOrigin.latitude,
      longitude: oldOrigin.longitude,
    });
  }, [userLocation, destination]);

  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      clearInterval(dlInterval.current);
    };
  }, []);

  const fireToast = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
    clearTimeout(toastTimer.current);
  }, []);

  const openPlace = useCallback((placeId) => {
    setSelectedPlaceId(placeId);
  }, []);

  const closePlace = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  const openRestaurant = useCallback((restaurantId) => {
    setSelectedRestaurantId(restaurantId);
  }, []);

  const closeRestaurant = useCallback(() => {
    setSelectedRestaurantId(null);
  }, []);

  const toggleVisitedRestaurant = useCallback((restaurantId) => {
    setVisitedRestaurants((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId],
    );
  }, []);

  const togglePlaceInDay = useCallback(
    (placeId) => {
      const target = PLACES.find((p) => p.id === placeId);
      if (!target) return;

      setAddedPlaces((prev) => {
        const exists = prev.includes(placeId);
        if (exists) {
          fireToast(`${target.name.split(',')[0]} removed from today`);
          return prev.filter((id) => id !== placeId);
        } else {
          fireToast(`${target.name.split(',')[0]} added · ₹${target.total}`);
          return [...prev, placeId];
        }
      });
      setSelectedPlaceId(null);
    },
    [fireToast],
  );

  const toggleDiet = useCallback((dietId) => {
    setDiets((prev) =>
      prev.includes(dietId) ? prev.filter((d) => d !== dietId) : [...prev, dietId],
    );
  }, []);

  const startPackDownload = useCallback(() => {
    if (packStatus === 'done') {
      fireToast('Pack already on this device');
      return;
    }
    setPackStatus('busy');
    setPackPct(0);
    clearInterval(dlInterval.current);
    dlInterval.current = setInterval(() => {
      setPackPct((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(dlInterval.current);
          setPackStatus('done');
          fireToast('Bengaluru pack downloaded!');
          return 100;
        }
        return next;
      });
    }, 180);
  }, [packStatus, fireToast]);

  // Derived calculations for Explore
  const byCostPlaces = useMemo(() => {
    return [...PLACES].sort((a, b) => a.total - b.total);
  }, []);

  const fitCount = useMemo(() => {
    return PLACES.filter((p) => p.total <= budget).length;
  }, [budget]);

  const dayPlan = useMemo(() => {
    const plan = [];
    let running = 0;
    for (const p of byCostPlaces) {
      if (plan.length < 4 && running + p.total <= budget) {
        plan.push(p);
        running += p.total;
      }
    }
    return plan;
  }, [budget, byCostPlaces]);

  const planTotal = useMemo(() => {
    return dayPlan.reduce((acc, p) => acc + p.total, 0);
  }, [dayPlan]);

  const planLeft = useMemo(() => {
    return Math.max(0, budget - planTotal);
  }, [budget, planTotal]);

  const selectedPlace = useMemo(() => {
    return PLACES.find((p) => p.id === selectedPlaceId) || null;
  }, [selectedPlaceId]);

  const selectedRestaurant = useMemo(() => {
    return RESTAURANTS.find((r) => r.id === selectedRestaurantId) || null;
  }, [selectedRestaurantId]);

  // Eateries within ~1000m of any station or waypoint on the active route
  const routeEateries = useMemo(() => {
    if (!activeRoute || !activeRoute.milestones || activeRoute.milestones.length === 0) {
      return [];
    }

    const routeWaypoints = activeRoute.milestones
      .filter((m) => m.coordinate && m.coordinate.latitude)
      .map((m) => ({
        label: m.title || m.label,
        lat: m.coordinate.latitude,
        lon: m.coordinate.longitude,
      }));

    if (routeWaypoints.length === 0) return [];

    const matched = [];
    for (const r of RESTAURANTS) {
      let minDistance = Infinity;
      let closestWp = null;

      for (const wp of routeWaypoints) {
        const d = getDistanceBetween(wp.lat, wp.lon, r.latitude, r.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestWp = wp;
        }
      }

      if (minDistance <= 1100) {
        matched.push({
          ...r,
          routeDistanceMeters: Math.round(minDistance),
          nearStationName: closestWp?.label || 'Route Station',
        });
      }
    }

    return matched.sort((a, b) => a.routeDistanceMeters - b.routeDistanceMeters);
  }, [activeRoute]);

  // Sorted/filtered restaurant list for Explore tab
  const filteredRestaurants = useMemo(() => {
    let list = [...RESTAURANTS];

    // cuisine filter
    if (cuisineFilter !== 'all') {
      list = list.filter((r) => r.cuisine === cuisineFilter);
    }

    // diet filter
    if (dietFilter === 'route') {
      const routeIds = new Set(routeEateries.map((re) => re.id));
      list = list.filter((r) => routeIds.has(r.id));
    } else if (dietFilter === 'veg') {
      list = list.filter((r) => !r.tags.includes('nonveg'));
    } else if (dietFilter === 'nonveg') {
      list = list.filter((r) => r.tags.includes('nonveg'));
    } else if (dietFilter === 'halal') {
      list = list.filter((r) => r.tags.includes('halal'));
    } else if (dietFilter === 'jain') {
      list = list.filter((r) => r.tags.includes('nog') && !r.tags.includes('nonveg'));
    }

    // sort by distance if location known
    if (userLocation) {
      list.sort((a, b) => {
        const da = getDistanceBetween(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const db = getDistanceBetween(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return da - db;
      });
    }

    return list;
  }, [cuisineFilter, dietFilter, userLocation, routeEateries]);

  // Filtered Eateries for Eat / Guide tab
  const filteredEateries = useMemo(() => {
    const list = EATERIES_DB[dish] || [];
    if (diets.length === 0) return list;

    return list.filter((e) =>
      diets.every((d) => {
        if (d === 'veg') return !e.tags.includes('nonveg');
        if (d === 'halal') return e.tags.includes('halal') || !e.tags.includes('nonveg');
        if (d === 'nog') return e.tags.includes('nog');
        if (d === 'jain') return e.tags.includes('nog');
        return true;
      }),
    );
  }, [dish, diets]);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      userLocation,
      isLocating,
      refreshUserLocation,
      changeUserLocation,
      destination,
      selectDestination,
      swapOriginDestination,
      activeRoute,
      activeStepIndex,
      setActiveStepIndex,
      recentSearches,
      budget,
      setBudget,
      places: PLACES,
      byCostPlaces,
      fitCount,
      dayPlan,
      planTotal,
      planLeft,
      selectedPlaceId,
      selectedPlace,
      openPlace,
      closePlace,
      addedPlaces,
      togglePlaceInDay,
      dish,
      setDish,
      diets,
      toggleDiet,
      filteredEateries,
      packStatus,
      packPct,
      startPackDownload,
      toast,
      fireToast,
      clearToast,
      // Search Modal
      isSearchOpen,
      searchTarget,
      openSearch,
      closeSearch,
      // Restaurant / Food tab
      cuisineFilter,
      setCuisineFilter,
      dietFilter,
      setDietFilter,
      selectedRestaurantId,
      selectedRestaurant,
      openRestaurant,
      closeRestaurant,
      visitedRestaurants,
      toggleVisitedRestaurant,
      filteredRestaurants,
      routeEateries,
      restaurants: RESTAURANTS,
    }),
    [
      tab,
      setTab,
      userLocation,
      isLocating,
      refreshUserLocation,
      changeUserLocation,
      destination,
      selectDestination,
      swapOriginDestination,
      activeRoute,
      activeStepIndex,
      recentSearches,
      isSearchOpen,
      searchTarget,
      openSearch,
      closeSearch,
      budget,
      byCostPlaces,
      fitCount,
      dayPlan,
      planTotal,
      planLeft,
      selectedPlaceId,
      selectedPlace,
      openPlace,
      closePlace,
      addedPlaces,
      togglePlaceInDay,
      dish,
      diets,
      toggleDiet,
      filteredEateries,
      packStatus,
      packPct,
      startPackDownload,
      toast,
      fireToast,
      clearToast,
      cuisineFilter,
      setCuisineFilter,
      dietFilter,
      setDietFilter,
      selectedRestaurantId,
      selectedRestaurant,
      openRestaurant,
      closeRestaurant,
      visitedRestaurants,
      toggleVisitedRestaurant,
      filteredRestaurants,
      routeEateries,
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
