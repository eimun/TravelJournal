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
import {
  getRestaurantsForCity,
  getDishesForCity,
  getEateriesDbForCity,
} from '../../app/data/cityPlacesData';
import { getDistanceBetween, POPULAR_DESTINATIONS } from '../../app/data/transitData';
import { getCurrentUserLocation, DEFAULT_BENGALURU_LOCATION } from '../../app/services/locationService';
import {
  planTransitRoute,
  planMultimodalRoutes,
  enrichRouteWithRealRoads,
  fetchRoadDistance,
} from '../../app/services/directionsService';
import { FEATURES, log, reportIssue, serializeError, setLogContext, setScreen } from '../logging';
import { auditRestaurants, withVerification } from '../../app/services/restaurantAudit';
import { getOpenStatus } from '../domain/openingHours';
import { fetchNearbyOsmRestaurants } from '../../app/services/osmRestaurantService';
import {
  fetchGooglePlacesRestaurants,
  fetchFoursquarePlacesRestaurants,
  API_KEYS,
} from '../../app/services/placesApiService';
import { SUPPORTED_CITIES, getCityConfig } from '../../app/data/citiesRegistry';
import { CITY_BOUNDS } from '../../app/services/searchService';

const TripContext = createContext(null);

function logLocationResult(loc, done) {
  if (!loc) return;
  if (loc.permissionDenied) {
    reportIssue('LOCATION_PERMISSION_DENIED', { key: 'foreground', message: 'Using default location' });
  } else if (loc.gpsUnavailable || loc.source === 'fallback') {
    reportIssue('LOCATION_FAILED', { key: 'gps', message: 'No GPS fix; using default location' });
  }
  done({
    source: loc.source || (loc.isDefault ? 'default' : 'gps'),
    name: loc.name,
    // Rounded to ~100 m so shared logs don't contain an exact home location.
    lat: Math.round(loc.latitude * 1000) / 1000,
    lon: Math.round(loc.longitude * 1000) / 1000,
  });
}

export function TripProvider({ children }) {
  // Navigation tabs: 'navigate' | 'explore' | 'guide' (with 'eat' & 'offline' aliased to 'guide')
  const [tab, setTabState] = useState('navigate');
  const [budget, setBudget] = useState(1200);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [addedPlaces, setAddedPlaces] = useState([]);

  // Multi-City Explorer state ('bengaluru' | 'delhi' | 'mumbai')
  const [cityId, setCityId] = useState('bengaluru');
  const [isCitySwitcherOpen, setIsCitySwitcherOpen] = useState(false);
  const currentCity = useMemo(() => getCityConfig(cityId), [cityId]);

  // Set once the user picks a city or an origin. A slow startup GPS fix must not
  // overwrite that choice (it used to replace a Mumbai origin with a Bengaluru GPS
  // point and produce an 835 km "trip").
  const originChosenRef = useRef(false);

  const switchCity = useCallback((newCityId) => {
    originChosenRef.current = true;
    const cfg = getCityConfig(newCityId);
    log.info(FEATURES.CITY, 'city.switch', { to: newCityId });
    setLogContext({ cityId: newCityId });
    setCityId(newCityId);
    setUserLocation({
      name: cfg.center?.name || `${cfg.name} Center`,
      latitude: cfg.center.latitude,
      longitude: cfg.center.longitude,
    });
    if (cfg.popularDestinations && cfg.popularDestinations.length > 0) {
      setDestination(cfg.popularDestinations[0]);
    }
    const dishes = getDishesForCity(newCityId);
    if (dishes && dishes.length > 0) {
      setDish(dishes[0].id);
    }
    // Clear restaurant state & filters when changing city
    setSelectedRestaurantId(null);
    setCuisineFilter('all');
    setDietFilter('all');
    setSourceFilter('all');
  }, []);

  const openCitySwitcher = useCallback(() => setIsCitySwitcherOpen(true), []);
  const closeCitySwitcher = useCallback(() => setIsCitySwitcherOpen(false), []);

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

  // Fare Reliability & Multi-Platform Audit Modal
  const [isFareReliabilityOpen, setIsFareReliabilityOpen] = useState(false);
  const openFareReliability = useCallback(() => {
    setIsFareReliabilityOpen(true);
  }, []);
  const closeFareReliability = useCallback(() => {
    setIsFareReliabilityOpen(false);
  }, []);

  // Food / Explore tab state
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all'); // 'all' | 'veg' | 'nonveg' | 'halal' | 'jain'
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'foursquare' | 'curated'
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [visitedRestaurants, setVisitedRestaurants] = useState([]);
  const [liveOsmRestaurants, setLiveOsmRestaurants] = useState([]);
  const [isFetchingOsm, setIsFetchingOsm] = useState(false);
  const [liveFetchStatus, setLiveFetchStatus] = useState(null);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [apiKeys, setApiKeys] = useState(API_KEYS);

  const setApiKey = useCallback((provider, key) => {
    setApiKeys((prev) => ({ ...prev, [provider]: key }));
  }, []);

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
    const resolved = nextTab === 'eat' || nextTab === 'offline' ? 'guide' : nextTab;
    setScreen(resolved);
    setTabState(resolved);
  }, []);

  // Initialize live GPS location on app start
  useEffect(() => {
    let mounted = true;
    async function initLocation() {
      try {
        setIsLocating(true);
        const done = log.time(FEATURES.LOCATION, 'location.initial');
        const loc = await getCurrentUserLocation();
        logLocationResult(loc, done);
        if (mounted) {
          if (originChosenRef.current) {
            log.info(FEATURES.LOCATION, 'location.initial_ignored', {
              reason: 'user already chose a city or origin before GPS answered',
            });
          } else {
            setUserLocation(loc);
          }
          setIsLocating(false);
        }
      } catch (err) {
        reportIssue('LOCATION_FAILED', { key: 'initial', message: err && err.message, data: serializeError(err) });
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
  const [seniorMode, setSeniorMode] = useState(false);

  const toggleSeniorMode = useCallback(() => {
    setSeniorMode((prev) => !prev);
  }, []);

  const [selectedRouteMode, setSelectedRouteMode] = useState(null);

  // Real road distance (OSRM) for meter fares; null until loaded or if routing fails.
  const [roadInfo, setRoadInfo] = useState(null);
  const tripKey = userLocation && destination
    ? `${userLocation.latitude.toFixed(5)},${userLocation.longitude.toFixed(5)}>${destination.latitude.toFixed(5)},${destination.longitude.toFixed(5)}`
    : null;
  useEffect(() => {
    if (!tripKey) return undefined;
    let cancelled = false;
    setRoadInfo(null);
    fetchRoadDistance(userLocation, destination).then((r) => {
      if (cancelled) return;
      if (r) {
        setRoadInfo({ key: tripKey, meters: r.meters, durationSec: r.durationSec });
      } else {
        reportIssue('FARE_ROAD_DISTANCE_ESTIMATED', {
          key: 'trip',
          message: 'OSRM road distance unavailable; fares use straight-line × detour factor',
          data: { destination: destination.name },
        });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripKey]);

  // Compute multimodal options (Metro combo, Direct Auto, Direct Cab, Bus)
  const multimodalPlan = useMemo(() => {
    if (!userLocation || !destination) return null;
    const road = roadInfo && roadInfo.key === tripKey ? roadInfo : null;
    try {
      const plan = planMultimodalRoutes(userLocation, destination, new Date(), {
        seniorMode,
        cityId,
        roadDistanceMeters: road ? road.meters : undefined,
        roadDurationSec: road ? road.durationSec : undefined,
      });
      log.info(FEATURES.NAV, 'route.planned', {
        cityId,
        from: userLocation.name,
        to: destination.name,
        straightKm: plan ? plan.distanceKm : null,
        roadKm: road ? Math.round(road.meters / 100) / 10 : null,
        recommended: plan ? plan.recommendedMode : null,
        options: plan ? plan.options.map((o) => ({ mode: o.mode, cost: o.cost, min: o.durationMinutes })) : [],
      });
      return plan;
    } catch (err) {
      reportIssue('NAV_PLAN_FAILED', {
        key: destination.name || 'destination',
        message: err && err.message,
        data: { error: serializeError(err), origin: userLocation, destination },
      });
      return null;
    }
  }, [userLocation, destination, seniorMode, cityId, roadInfo, tripKey]);

  const activeMode = selectedRouteMode || multimodalPlan?.recommendedMode || 'metro';

  // Compute baseline active route based on selected mode
  const baseRoute = useMemo(() => {
    if (!multimodalPlan) return null;
    return multimodalPlan.routes?.[activeMode] || multimodalPlan.routes?.metro || null;
  }, [multimodalPlan, activeMode]);

  // Asynchronously fetch real street road geometry and update route
  useEffect(() => {
    let cancelled = false;
    setEnrichedRoute(null);
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
    const done = log.time(FEATURES.LOCATION, 'location.refresh');
    const loc = await getCurrentUserLocation();
    logLocationResult(loc, done);
    setUserLocation(loc);
    setIsLocating(false);
  }, []);

  const selectDestination = useCallback((dest) => {
    log.info(FEATURES.NAV, 'destination.selected', dest ? { id: dest.id, name: dest.name, lat: dest.latitude, lon: dest.longitude } : null);
    setDestination(dest);
    setSelectedRouteMode(null); // Reset mode for new destination so recommendation activates
    if (dest) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((d) => d && d.id !== dest.id);
        return [dest, ...filtered].slice(0, 6);
      });
    }
  }, []);

  const changeUserLocation = useCallback((newLoc) => {
    originChosenRef.current = true;
    setUserLocation(newLoc);
  }, []);

  const swapOriginDestination = useCallback(() => {
    if (!userLocation || !destination) return;
    originChosenRef.current = true;
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
    log.info(FEATURES.FOOD, 'restaurant.open', { id: restaurantId });
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

  const fetchNearbyLive = useCallback(
    async (customLat, customLon, areaName, preferredProvider = 'auto', targetCityId) => {
      const activeCity = targetCityId || cityId;
      const cfg = getCityConfig(activeCity);
      const lat = customLat || userLocation?.latitude || cfg.center.latitude;
      const lon = customLon || userLocation?.longitude || cfg.center.longitude;

      setIsFetchingOsm(true);
      const done = log.time(FEATURES.FOOD, 'live_fetch', { cityId: activeCity, preferredProvider, areaName });
      const attempted = [];
      try {
        let results = [];
        let sourceUsed = 'OpenStreetMap';

        // 1. Try Google Places if key configured
        if ((preferredProvider === 'google' || preferredProvider === 'auto') && apiKeys.google) {
          attempted.push('google');
          results = await fetchGooglePlacesRestaurants({
            latitude: lat,
            longitude: lon,
            apiKey: apiKeys.google,
            cityId: activeCity,
          });
          if (results.length > 0) sourceUsed = 'Google Places';
        }

        // 2. Try Foursquare Places if key configured and no results yet
        if (
          results.length === 0 &&
          (preferredProvider === 'foursquare' || preferredProvider === 'auto') &&
          apiKeys.foursquare
        ) {
          const searchQuery =
            cuisineFilter && cuisineFilter !== 'all'
              ? `${cuisineFilter} restaurant`
              : 'restaurant';
          attempted.push('foursquare');
          results = await fetchFoursquarePlacesRestaurants({
            latitude: lat,
            longitude: lon,
            query: searchQuery,
            apiKey: apiKeys.foursquare,
            cityId: activeCity,
          });
          if (results.length > 0) sourceUsed = 'Foursquare';
        }

        // 3. Fallback to OpenStreetMap Overpass (No key required, 100% free)
        if (results.length === 0) {
          attempted.push('osm');
          results = await fetchNearbyOsmRestaurants({
            latitude: lat,
            longitude: lon,
            radiusMeters: 2200,
            limit: 40,
            cityId: activeCity,
          });
          if (results.length > 0) sourceUsed = 'OpenStreetMap';
        }

        if (results && results.length > 0) {
          const tagged = results.map((r) => ({
            ...r,
            cityId: activeCity,
          }));
          setLiveOsmRestaurants((prev) => {
            const others = prev.filter((r) => r.cityId && r.cityId !== activeCity);
            const map = new Map();
            tagged.forEach((r) => map.set(r.id, r));
            return [...others, ...Array.from(map.values())];
          });
          const locationLabel = areaName ? ` near ${areaName}` : '';
          done({ ok: true, source: sourceUsed, count: results.length, attempted });
          setLiveFetchStatus({ state: 'ok', source: sourceUsed, count: results.length, at: new Date().toISOString() });
          fireToast(`Found ${results.length} places from ${sourceUsed}${locationLabel}`);
          return tagged;
        } else {
          done({ ok: false, count: 0, attempted });
          reportIssue('FOOD_ALL_PROVIDERS_FAILED', {
            key: activeCity,
            message: `No live results from ${attempted.join(', ')} — see NET entries for the cause`,
            data: { attempted, lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 },
          });
          setLiveFetchStatus({ state: 'failed', attempted, at: new Date().toISOString() });
          fireToast('Live restaurant search failed. Showing saved places only.');
          return [];
        }
      } catch (err) {
        done.fail(err, { attempted });
        reportIssue('FOOD_ALL_PROVIDERS_FAILED', { key: activeCity, message: err && err.message, data: serializeError(err) });
        setLiveFetchStatus({ state: 'failed', attempted, at: new Date().toISOString() });
        fireToast('Live restaurant search failed. Showing saved places only.');
        return [];
      } finally {
        setIsFetchingOsm(false);
      }
    },
    [userLocation, apiKeys, fireToast, cityId, cuisineFilter],
  );

  const fetchNearbyOsm = fetchNearbyLive;

  // Automatically fetch live Foursquare / OSM restaurants on startup or city switch
  const lastFetchedCityRef = useRef(null);
  useEffect(() => {
    if (userLocation && lastFetchedCityRef.current !== cityId) {
      lastFetchedCityRef.current = cityId;
      fetchNearbyLive(
        userLocation.latitude,
        userLocation.longitude,
        userLocation.name || `${currentCity.name} Center`,
        'auto',
        cityId,
      );
    }
  }, [cityId, userLocation, fetchNearbyLive, currentCity]);

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

  const curatedRestaurants = useMemo(
    () => getRestaurantsForCity(cityId).map((r) => withVerification(r, cityId)),
    [cityId],
  );

  const allRestaurants = useMemo(() => {
    const baseRestaurants = curatedRestaurants;
    if (!liveOsmRestaurants || liveOsmRestaurants.length === 0) {
      return baseRestaurants;
    }
    const bounds = CITY_BOUNDS[cityId];
    const cityLive = liveOsmRestaurants.filter((r) => {
      // Strictly isolate by cityId tag
      if (r.cityId) {
        return r.cityId === cityId;
      }
      // Or strictly isolate by geographic coordinates bounding box
      if (bounds) {
        return (
          r.latitude >= bounds.minLat &&
          r.latitude <= bounds.maxLat &&
          r.longitude >= bounds.minLon &&
          r.longitude <= bounds.maxLon
        );
      }
      return false;
    });

    if (cityLive.length === 0) {
      return baseRestaurants;
    }

    const existingIds = new Set(baseRestaurants.map((r) => r.id));
    const existingNames = new Set(baseRestaurants.map((r) => r.name.toLowerCase().trim()));
    const uniqueLive = cityLive.filter(
      (r) => !existingIds.has(r.id) && !existingNames.has(r.name.toLowerCase().trim()),
    );
    return [...uniqueLive, ...baseRestaurants];
  }, [liveOsmRestaurants, cityId, curatedRestaurants]);

  // Data-quality audit (logs MAJOR / MINOR issues once per restaurant per session).
  useEffect(() => {
    auditRestaurants(allRestaurants, cityId);
  }, [allRestaurants, cityId]);

  const selectedRestaurant = useMemo(() => {
    return allRestaurants.find((r) => r.id === selectedRestaurantId) || null;
  }, [allRestaurants, selectedRestaurantId]);

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
    for (const r of allRestaurants) {
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
  }, [activeRoute, allRestaurants]);

  // Sorted/filtered restaurant list for Explore tab
  const filteredRestaurants = useMemo(() => {
    let list = [...allRestaurants];

    // Source filter: 'all' | 'foursquare' | 'curated'
    if (sourceFilter === 'foursquare') {
      list = list.filter((r) => r.source === 'foursquare' || r.isFsqLive);
    } else if (sourceFilter === 'curated') {
      list = list.filter((r) => !r.isLive && r.source !== 'foursquare');
    }

    // cuisine filter (supporting dessert/desserts aliases)
    if (cuisineFilter !== 'all') {
      list = list.filter((r) => {
        if (r.cuisine === cuisineFilter) return true;
        if (cuisineFilter === 'desserts' && r.cuisine === 'dessert') return true;
        if (cuisineFilter === 'dessert' && r.cuisine === 'desserts') return true;
        return false;
      });
    }

    // diet filter
    if (dietFilter === 'route') {
      const routeIds = new Set(routeEateries.map((re) => re.id));
      list = list.filter((r) => routeIds.has(r.id));
    } else if (dietFilter === 'veg') {
      // Pure veg only when a source says so; unknown diet is NOT treated as veg.
      list = list.filter((r) => (r.tags || []).includes('veg') && !(r.tags || []).includes('nonveg'));
    } else if (dietFilter === 'nonveg') {
      list = list.filter((r) => (r.tags || []).includes('nonveg'));
    } else if (dietFilter === 'halal') {
      list = list.filter((r) => (r.tags || []).includes('halal'));
    } else if (dietFilter === 'jain') {
      list = list.filter((r) => ((r.tags || []).includes('jain') || (r.tags || []).includes('nog')) && !(r.tags || []).includes('nonveg'));
    }

    if (onlyOpenNow) {
      const now = new Date();
      list = list.filter((r) => getOpenStatus(r.schedule, now).isOpen === true || r.isOpenFromProvider === true);
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
  }, [allRestaurants, sourceFilter, cuisineFilter, dietFilter, userLocation, routeEateries, onlyOpenNow]);

  // Filtered Eateries for Eat / Guide tab
  const filteredEateries = useMemo(() => {
    const cityEateriesDb = getEateriesDbForCity(cityId);
    const list = cityEateriesDb[dish] || EATERIES_DB[dish] || [];
    if (diets.length === 0) return list;

    return list.filter((e) =>
      diets.every((d) => {
        const tags = e.tags || [];
        if (d === 'veg') return !tags.includes('nonveg');
        if (d === 'halal') return tags.includes('halal') || !tags.includes('nonveg');
        if (d === 'nog') return tags.includes('nog');
        if (d === 'jain') return tags.includes('nog');
        return true;
      }),
    );
  }, [dish, diets, cityId]);

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
      multimodalPlan,
      selectedRouteMode: activeMode,
      setRouteMode: setSelectedRouteMode,
      activeStepIndex,
      setActiveStepIndex,
      seniorMode,
      toggleSeniorMode,
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
      // Multi-City Explorer
      currentCity,
      cityId,
      switchCity,
      isCitySwitcherOpen,
      openCitySwitcher,
      closeCitySwitcher,
      // Search Modal
      isSearchOpen,
      searchTarget,
      openSearch,
      closeSearch,
      // Fare Reliability Modal
      isFareReliabilityOpen,
      openFareReliability,
      closeFareReliability,
      // Restaurant / Food tab
      sourceFilter,
      setSourceFilter,
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
      liveOsmRestaurants,
      isFetchingOsm,
      fetchNearbyOsm,
      fetchNearbyLive,
      liveFetchStatus,
      onlyOpenNow,
      setOnlyOpenNow,
      apiKeys,
      setApiKey,
      allRestaurants,
      restaurants: allRestaurants,
      cityDishes: getDishesForCity(cityId),
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
      multimodalPlan,
      activeMode,
      activeStepIndex,
      setActiveStepIndex,
      seniorMode,
      toggleSeniorMode,
      recentSearches,
      currentCity,
      cityId,
      switchCity,
      isCitySwitcherOpen,
      openCitySwitcher,
      closeCitySwitcher,
      isSearchOpen,
      searchTarget,
      openSearch,
      closeSearch,
      isFareReliabilityOpen,
      openFareReliability,
      closeFareReliability,
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
      sourceFilter,
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
      liveOsmRestaurants,
      isFetchingOsm,
      fetchNearbyOsm,
      fetchNearbyLive,
      liveFetchStatus,
      onlyOpenNow,
      allRestaurants,
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
