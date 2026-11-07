const STORAGE_KEYS = {
  CITY: 'city_swiper_selected_city_v1',
  SWIPED_IDS: 'city_swiper_swiped_place_ids_v1',
  SAVED_PLACES: 'city_swiper_saved_places_v1',
  DISCOVERY_CURSOR: 'city_swiper_discovery_cursor_v1',
  DECK_CACHE: 'city_swiper_deck_cache_v1',
};

const MAX_CACHED_CITIES = 15;

export function buildCityPoolKey(cityMeta) {
  if (!cityMeta) return '';
  const country = String(cityMeta.queryCountry || cityMeta.country || '')
    .toLowerCase()
    .trim();
  const city = String(cityMeta.queryCity || cityMeta.city || '')
    .toLowerCase()
    .trim();
  return country && city ? `${country}::${city}` : '';
}

function safeReadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors gracefully
  }
}

class StorageService {
  constructor() {
    const storedSwipes = safeReadJson(STORAGE_KEYS.SWIPED_IDS, {});
    // Support both array and object formats safely
    if (Array.isArray(storedSwipes)) {
      this.swipedMap = {};
      for (const id of storedSwipes) {
        if (typeof id === 'string') {
          this.swipedMap[id] = { action: 'seen', ts: Date.now() };
        }
      }
    } else if (storedSwipes && typeof storedSwipes === 'object') {
      this.swipedMap = storedSwipes;
    } else {
      this.swipedMap = {};
    }

    this.swipedSet = new Set(Object.keys(this.swipedMap));
    const saved = safeReadJson(STORAGE_KEYS.SAVED_PLACES, []);
    this.savedPlaces = Array.isArray(saved) ? saved : [];
    this.cursors = safeReadJson(STORAGE_KEYS.DISCOVERY_CURSOR, {});
    const rawDeckCache = safeReadJson(STORAGE_KEYS.DECK_CACHE, {});
    this.deckCache =
      rawDeckCache && typeof rawDeckCache === 'object' && !Array.isArray(rawDeckCache)
        ? rawDeckCache
        : {};
  }

  getSelectedCity() {
    const city = safeReadJson(STORAGE_KEYS.CITY, null);
    if (city && city.country && city.city) {
      return city;
    }
    return null;
  }

  setSelectedCity(cityMeta) {
    safeWriteJson(STORAGE_KEYS.CITY, cityMeta);
  }

  hasSwiped(placeId) {
    if (!placeId) return false;
    return this.swipedSet.has(placeId);
  }

  getSwipedCount() {
    return this.swipedSet.size;
  }

  /**
   * Record a swiped card's place_id in localStorage so it never reappears in the stack.
   * Directions:
   * - 'left'  -> not interested
   * - 'right' -> interested
   * - 'up'    -> favorite
   * - 'down'  -> skip
   */
  recordSwipe(place, direction, cityMeta) {
    if (!place?.placeId) return;

    this.swipedSet.add(place.placeId);
    this.swipedMap[place.placeId] = {
      action: direction,
      ts: Date.now(),
      city: cityMeta?.city || '',
    };
    safeWriteJson(STORAGE_KEYS.SWIPED_IDS, this.swipedMap);
    this._removeSwipedFromDeckCache(place.placeId, cityMeta);

    if (direction === 'right' || direction === 'up') {
      const existingIdx = this.savedPlaces.findIndex(
        (item) => item.placeId === place.placeId,
      );
      const entry = {
        placeId: place.placeId,
        name: place.name,
        category: place.category,
        categoryLabel: place.categoryLabel,
        photoUrl: place.photoUrl,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        priceSymbol: place.priceSymbol,
        address: place.address,
        mapsUrl: place.mapsUrl,
        openNow: typeof place.openNow === 'boolean' ? place.openNow : null,
        openingHours: place.openingHours || null,
        location: place.location || null,
        cityCenter: place.cityCenter || null,
        distanceKm: typeof place.distanceKm === 'number' ? place.distanceKm : null,
        city: cityMeta?.city || '',
        country: cityMeta?.country || '',
        status: direction === 'up' ? 'favorite' : 'interested',
        savedAt: Date.now(),
      };

      if (existingIdx >= 0) {
        this.savedPlaces[existingIdx] = entry;
      } else {
        this.savedPlaces.unshift(entry);
      }
      safeWriteJson(STORAGE_KEYS.SAVED_PLACES, this.savedPlaces);
    }
  }

  mergeHydratedSavedPlaces(hydratedMap) {
    if (!hydratedMap || typeof hydratedMap !== 'object') return false;
    let changed = false;
    this.savedPlaces = this.savedPlaces.map((item) => {
      const extra = hydratedMap[item.placeId];
      if (!extra) return item;
      changed = true;
      return {
        ...item,
        location: extra.location ?? item.location ?? null,
        cityCenter: extra.cityCenter ?? item.cityCenter ?? null,
        distanceKm:
          typeof extra.distanceKm === 'number'
            ? extra.distanceKm
            : item.distanceKm ?? null,
        openingHours: extra.openingHours ?? item.openingHours ?? null,
        openNow:
          typeof extra.openNow === 'boolean' ? extra.openNow : item.openNow ?? null,
      };
    });

    if (changed) {
      safeWriteJson(STORAGE_KEYS.SAVED_PLACES, this.savedPlaces);
    }
    return changed;
  }

  filterUnswiped(places) {
    if (!Array.isArray(places)) return [];
    return places.filter((p) => p?.placeId && !this.swipedSet.has(p.placeId));
  }

  getSavedPlaces() {
    return [...this.savedPlaces];
  }

  removeSavedPlace(placeId) {
    this.savedPlaces = this.savedPlaces.filter((p) => p.placeId !== placeId);
    safeWriteJson(STORAGE_KEYS.SAVED_PLACES, this.savedPlaces);
  }

  clearCitySwipeHistory(cityName, cityMeta = null) {
    if (!cityName) return;
    const nextMap = {};
    for (const [id, meta] of Object.entries(this.swipedMap)) {
      if (meta?.city && meta.city.toLowerCase() === cityName.toLowerCase()) {
        continue;
      }
      nextMap[id] = meta;
    }
    this.swipedMap = nextMap;
    this.swipedSet = new Set(Object.keys(this.swipedMap));
    safeWriteJson(STORAGE_KEYS.SWIPED_IDS, this.swipedMap);

    const poolKey = buildCityPoolKey(cityMeta);
    if (poolKey && this.deckCache[poolKey]) {
      delete this.deckCache[poolKey];
      safeWriteJson(STORAGE_KEYS.DECK_CACHE, this.deckCache);
    }
  }

  _ensureCityCacheEntry(poolKey) {
    if (!this.deckCache[poolKey] || typeof this.deckCache[poolKey] !== 'object') {
      this.deckCache[poolKey] = {
        places: [],
        resolvedCity: null,
        buckets: {},
        updatedAt: Date.now(),
      };
    }
    const entry = this.deckCache[poolKey];
    if (!Array.isArray(entry.places)) entry.places = [];
    if (!entry.buckets || typeof entry.buckets !== 'object') entry.buckets = {};
    return entry;
  }

  _removeSwipedFromDeckCache(placeId, cityMeta) {
    if (!placeId) return;
    let mutated = false;
    const targetPoolKey = buildCityPoolKey(cityMeta);
    const keysToCheck = targetPoolKey
      ? [targetPoolKey, ...Object.keys(this.deckCache).filter((k) => k !== targetPoolKey)]
      : Object.keys(this.deckCache);

    for (const key of keysToCheck) {
      const entry = this.deckCache[key];
      if (!entry || !Array.isArray(entry.places)) continue;
      const before = entry.places.length;
      if (before === 0) continue;
      entry.places = entry.places.filter((p) => p?.placeId && !this.swipedSet.has(p.placeId));
      if (entry.places.length !== before) {
        entry.updatedAt = Date.now();
        mutated = true;
      }
    }

    if (mutated) {
      safeWriteJson(STORAGE_KEYS.DECK_CACHE, this.deckCache);
    }
  }

  /**
   * Returns remaining unswiped places and saved pagination state for a city/category from localStorage
   * so page reloads never hit Google Places API while cards remain in the current batch.
   */
  getCachedDeckState(cityMeta, category = 'all') {
    const poolKey = buildCityPoolKey(cityMeta);
    if (!poolKey || !this.deckCache[poolKey]) {
      const legacyKey = cityMeta
        ? `${String(cityMeta.queryCountry || '').toLowerCase()}::${String(
            cityMeta.queryCity || '',
          ).toLowerCase()}::${category}`
        : '';
      return {
        places: [],
        resolvedCity: null,
        bucket: {
          pageTokens: {},
          discoveryRound: this.getDiscoveryRound(legacyKey),
          exhausted: false,
        },
      };
    }

    const entry = this._ensureCityCacheEntry(poolKey);
    const unswipedAll = entry.places.filter(
      (p) => p?.placeId && !this.swipedSet.has(p.placeId),
    );
    if (unswipedAll.length !== entry.places.length) {
      entry.places = unswipedAll;
      safeWriteJson(STORAGE_KEYS.DECK_CACHE, this.deckCache);
    }

    const matchingPlaces =
      category === 'all'
        ? unswipedAll
        : unswipedAll.filter((p) => p.category === category);

    const savedBucket = entry.buckets[category] || {};
    return {
      places: matchingPlaces,
      resolvedCity: entry.resolvedCity || null,
      bucket: {
        pageTokens:
          savedBucket.pageTokens && typeof savedBucket.pageTokens === 'object'
            ? { ...savedBucket.pageTokens }
            : {},
        discoveryRound: Number(savedBucket.discoveryRound) || 0,
        exhausted: Boolean(savedBucket.exhausted),
      },
    };
  }

  /**
   * Persists a newly fetched batch of places and pagination cursors in localStorage.
   */
  saveFetchedDeckBatch(
    cityMeta,
    category = 'all',
    { places = [], resolvedCity = null, pageTokens = {}, discoveryRound = 0, exhausted = false } = {},
  ) {
    const poolKey = buildCityPoolKey(cityMeta);
    if (!poolKey) return;

    const entry = this._ensureCityCacheEntry(poolKey);
    const seenIds = new Set(entry.places.map((p) => p?.placeId).filter(Boolean));

    for (const place of places) {
      if (
        place?.placeId &&
        !this.swipedSet.has(place.placeId) &&
        !seenIds.has(place.placeId)
      ) {
        seenIds.add(place.placeId);
        entry.places.push(place);
      }
    }

    if (resolvedCity && resolvedCity.location) {
      entry.resolvedCity = {
        location: resolvedCity.location,
        viewport: resolvedCity.viewport || null,
      };
    }

    entry.buckets[category] = {
      pageTokens: pageTokens && typeof pageTokens === 'object' ? { ...pageTokens } : {},
      discoveryRound: Number(discoveryRound) || 0,
      exhausted: Boolean(exhausted),
    };

    // Seed single-category nextPageTokens from an initial 'all' fetch so switching tabs never re-fetches Page 1
    if (category === 'all' && pageTokens && typeof pageTokens === 'object') {
      for (const subCat of ['restaurant', 'bar', 'cafe']) {
        if (pageTokens[subCat] && !entry.buckets[subCat]) {
          entry.buckets[subCat] = {
            pageTokens: { [subCat]: pageTokens[subCat] },
            discoveryRound: Number(discoveryRound) || 0,
            exhausted: false,
          };
        }
      }
    }

    entry.updatedAt = Date.now();

    // Bound total cached cities in localStorage so storage stays lightweight
    const allKeys = Object.keys(this.deckCache);
    if (allKeys.length > MAX_CACHED_CITIES) {
      allKeys
        .sort(
          (a, b) =>
            (Number(this.deckCache[b]?.updatedAt) || 0) -
            (Number(this.deckCache[a]?.updatedAt) || 0),
        )
        .slice(MAX_CACHED_CITIES)
        .forEach((oldKey) => {
          delete this.deckCache[oldKey];
        });
    }

    safeWriteJson(STORAGE_KEYS.DECK_CACHE, this.deckCache);
  }

  getDiscoveryRound(cityKey) {
    return Number(this.cursors?.[cityKey]) || 0;
  }

  setDiscoveryRound(cityKey, round) {
    if (!this.cursors || typeof this.cursors !== 'object') {
      this.cursors = {};
    }
    this.cursors[cityKey] = round;
    safeWriteJson(STORAGE_KEYS.DISCOVERY_CURSOR, this.cursors);
  }
}

export const storage = new StorageService();

