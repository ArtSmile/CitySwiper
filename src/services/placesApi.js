/* global __GOOGLE_PLACES_API_KEY__ */
import { storage } from './storage.js';

const PLACES_API_BASE = 'https://places.googleapis.com/v1';
const PHOTO_REF_PREFIX = 'gphoto:';
const PHOTO_NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;
const PLACE_ID_RE = /^[A-Za-z0-9_-]+$/;
const MAX_DISCOVERY_HOPS = 4;

// Strictly Essentials-tier geometry fields needed to bound search & compute distance from center
const CITY_FIELD_MASK = ['places.location', 'places.viewport'].join(',');

const AUTOCOMPLETE_FIELD_MASK = [
  'suggestions.placePrediction.structuredFormat.mainText.text',
  'suggestions.placePrediction.structuredFormat.secondaryText.text',
].join(',');

// Strictly the fields actually rendered on venue cards & collection filters (zero Atmosphere / unused fields)
const DISCOVER_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.shortFormattedAddress',
  'places.primaryTypeDisplayName',
  'places.photos.name',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.location',
  'places.utcOffsetMinutes',
  'places.regularOpeningHours.openNow',
  'places.regularOpeningHours.periods',
  'nextPageToken',
].join(',');

const HYDRATE_FIELD_MASK = [
  'location',
  'utcOffsetMinutes',
  'regularOpeningHours.openNow',
  'regularOpeningHours.periods',
].join(',');

const CATEGORY_CONFIG = {
  restaurant: {
    includedType: 'restaurant',
    queries: [
      (city, country) => `restaurants in ${city}, ${country}`,
      (city, country) => `new restaurants and bistros in ${city}, ${country}`,
      (city, country) => `local dining and gastro restaurants in ${city}, ${country}`,
      (city, country) => `popular dinner spots in ${city}, ${country}`,
    ],
  },
  bar: {
    includedType: 'bar',
    queries: [
      (city, country) => `bars and cocktail lounges in ${city}, ${country}`,
      (city, country) => `new bars and wine bars in ${city}, ${country}`,
      (city, country) => `craft beer pubs and speakeasy bars in ${city}, ${country}`,
      (city, country) => `rooftop and evening bars in ${city}, ${country}`,
    ],
  },
  cafe: {
    includedType: 'cafe',
    queries: [
      (city, country) => `cafes and coffee shops in ${city}, ${country}`,
      (city, country) => `new specialty coffee and cafes in ${city}, ${country}`,
      (city, country) => `brunch cafes and espresso bars in ${city}, ${country}`,
      (city, country) => `artisan bakery cafes in ${city}, ${country}`,
    ],
  },
};

const cityCache = new Map();
const citySuggestCache = new Map();
const photoUriCache = new Map();
const photoInFlightMap = new Map();
const placeDetailsCache = new Map();

function getClientApiKey() {
  try {
    const custom = window.localStorage.getItem('city_swiper_google_api_key_v1');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  } catch {
    // Ignore storage read restrictions
  }

  const viteKey = import.meta.env?.VITE_GOOGLE_PLACES_API_KEY;
  if (viteKey && String(viteKey).trim()) {
    return String(viteKey).trim();
  }

  if (typeof __GOOGLE_PLACES_API_KEY__ === 'string' && __GOOGLE_PLACES_API_KEY__.trim()) {
    return __GOOGLE_PLACES_API_KEY__.trim();
  }

  return '';
}

function requireApiKey() {
  const key = getClientApiKey();
  if (!key) {
    const err = new Error('Не задан ключ доступа к Google Places API (New).');
    err.details = {
      code: 401,
      status: 'MISSING_API_KEY',
      reason: 'MISSING_API_KEY',
      message: 'Не задан ключ доступа к Google Places API (New).',
    };
    throw err;
  }
  return key;
}

function parseGoogleError(status, data) {
  const errObj = data?.error || {};
  const details = Array.isArray(errObj.details) ? errObj.details : [];
  const errorInfo = details.find((d) => d?.reason);
  const helpLinks = details.flatMap((d) => d?.links || []);
  const activationUrl =
    errorInfo?.metadata?.activationUrl ||
    helpLinks.find((l) => l?.url)?.url ||
    null;

  return {
    code: errObj.code || status,
    status: errObj.status || 'API_ERROR',
    reason: errorInfo?.reason || null,
    message: errObj.message || `Google Places API error (${status})`,
    activationUrl,
  };
}

function isValidViewport(vp) {
  if (!vp || !vp.low || !vp.high) return false;
  const { low, high } = vp;
  if (
    typeof low.latitude !== 'number' ||
    typeof low.longitude !== 'number' ||
    typeof high.latitude !== 'number' ||
    typeof high.longitude !== 'number'
  ) {
    return false;
  }
  const latSpan = high.latitude - low.latitude;
  const lngSpan = high.longitude - low.longitude;
  return latSpan > 0.001 && latSpan < 5 && lngSpan > 0.001 && lngSpan < 5;
}

function formatPriceInfo(priceLevel) {
  const map = {
    PRICE_LEVEL_FREE: { symbol: 'Free', tier: 0, label: 'Бесплатно' },
    PRICE_LEVEL_INEXPENSIVE: { symbol: '$', tier: 1, label: 'Демократично' },
    PRICE_LEVEL_MODERATE: { symbol: '$$', tier: 2, label: 'Средний чек' },
    PRICE_LEVEL_EXPENSIVE: { symbol: '$$$', tier: 3, label: 'Высокий чек' },
    PRICE_LEVEL_VERY_EXPENSIVE: { symbol: '$$$$', tier: 4, label: 'Премиум' },
  };
  if (priceLevel && map[priceLevel]) {
    return map[priceLevel];
  }
  return { symbol: '$$', tier: 0, label: 'Чек не указан' };
}

function computeDistanceKm(locA, locB) {
  if (
    !locA ||
    !locB ||
    typeof locA.latitude !== 'number' ||
    typeof locA.longitude !== 'number' ||
    typeof locB.latitude !== 'number' ||
    typeof locB.longitude !== 'number'
  ) {
    return null;
  }
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(locB.latitude - locA.latitude);
  const dLng = toRad(locB.longitude - locA.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(locA.latitude)) *
      Math.cos(toRad(locB.latitude)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function extractOpeningHours(regularOpeningHours, utcOffsetMinutes) {
  if (!regularOpeningHours) return null;
  const rawPeriods = Array.isArray(regularOpeningHours.periods)
    ? regularOpeningHours.periods
    : [];
  const periods = rawPeriods
    .filter(
      (p) =>
        p?.open &&
        typeof p.open.day === 'number' &&
        typeof p.open.hour === 'number',
    )
    .map((p) => ({
      open: {
        day: p.open.day,
        hour: p.open.hour,
        minute: Number(p.open.minute) || 0,
      },
      close:
        p.close &&
        typeof p.close.day === 'number' &&
        typeof p.close.hour === 'number'
          ? {
              day: p.close.day,
              hour: p.close.hour,
              minute: Number(p.close.minute) || 0,
            }
          : null,
    }));

  return {
    openNowSnapshot:
      typeof regularOpeningHours.openNow === 'boolean'
        ? regularOpeningHours.openNow
        : null,
    periods,
    utcOffsetMinutes:
      typeof utcOffsetMinutes === 'number' ? utcOffsetMinutes : null,
  };
}

/**
 * Extracts a Google Places photo resource name ("places/.../photos/...") from either:
 * - client-side token "gphoto:places/.../photos/..."
 * - legacy local middleware URL "/api/places/photo?name=places%2F..."
 */
export function extractGooglePhotoName(rawRef) {
  const ref = String(rawRef || '').trim();
  if (!ref) return null;

  if (ref.startsWith(PHOTO_REF_PREFIX)) {
    const candidate = ref.slice(PHOTO_REF_PREFIX.length).trim();
    return PHOTO_NAME_RE.test(candidate) ? candidate : null;
  }

  if (ref.startsWith('/api/places/photo') || ref.startsWith('./api/places/photo')) {
    try {
      const parsed = new URL(ref, 'https://cityswiper.local');
      const candidate = (parsed.searchParams.get('name') || '').trim();
      return PHOTO_NAME_RE.test(candidate) ? candidate : null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Resolves a lazy photo token ("gphoto:places/.../photos/...") directly in the browser via
 * Google Places Photos Media API (skipHttpRedirect=true) with in-memory TTL caching & deduplication.
 * Non-Google URLs (e.g. demo mode images) pass through untouched.
 */
export async function resolvePhotoUrl(
  rawRef,
  { maxWidthPx = 720, maxHeightPx = 900, priority = null } = {},
) {
  const photoName = extractGooglePhotoName(rawRef);
  if (!photoName) {
    return String(rawRef || '');
  }

  const w = Math.min(Math.max(Number(maxWidthPx) || 720, 200), 1600);
  const h = Math.min(Math.max(Number(maxHeightPx) || 900, 200), 1600);
  const now = Date.now();
  const exactKey = `${photoName}@${w}x${h}`;

  const exactCached = photoUriCache.get(exactKey);
  if (exactCached && exactCached.expiresAt > now) {
    return exactCached.photoUri;
  }

  // If requesting a small collection thumbnail, reuse an already-resolved deck photo URI at zero API cost
  if (w <= 300) {
    const deckCached = photoUriCache.get(`${photoName}@720x900`);
    if (deckCached && deckCached.expiresAt > now) {
      return deckCached.photoUri;
    }
  }

  if (photoInFlightMap.has(exactKey)) {
    return photoInFlightMap.get(exactKey);
  }

  const requestPromise = (async () => {
    const apiKey = requireApiKey();
    const mediaUrl = `${PLACES_API_BASE}/${photoName}/media?maxWidthPx=${w}&maxHeightPx=${h}&skipHttpRedirect=true`;
    const fetchOpts = {
      headers: {
        'X-Goog-Api-Key': apiKey,
      },
    };
    if (priority === 'high' || priority === 'low') {
      fetchOpts.priority = priority;
    }

    const mediaRes = await fetch(mediaUrl, fetchOpts);
    const mediaData = await mediaRes.json().catch(() => ({}));

    if (!mediaRes.ok || !mediaData?.photoUri) {
      const err = new Error('Не удалось загрузить фотографию места.');
      err.details = parseGoogleError(mediaRes.status || 502, mediaData);
      throw err;
    }

    photoUriCache.set(exactKey, {
      photoUri: mediaData.photoUri,
      expiresAt: Date.now() + 50 * 60 * 1000,
    });

    return mediaData.photoUri;
  })().finally(() => {
    photoInFlightMap.delete(exactKey);
  });

  photoInFlightMap.set(exactKey, requestPromise);
  return requestPromise;
}

function normalizePlace(place, fallbackCategory, cityCenterLocation = null) {
  if (!place?.id || !place?.displayName?.text) return null;

  const photos = Array.isArray(place.photos) ? place.photos : [];
  const photoUrls = photos
    .slice(0, 5)
    .map((p) =>
      p?.name && PHOTO_NAME_RE.test(p.name) ? `${PHOTO_REF_PREFIX}${p.name}` : null,
    )
    .filter(Boolean);

  const name = place.displayName.text;
  const address = place.shortFormattedAddress || 'Адрес уточняется';
  const price = formatPriceInfo(place.priceLevel);

  // Official Google Maps Universal Cross-Platform URL:
  // Opens natively in Google Maps iOS/Android app if installed, otherwise gracefully in browser
  const universalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    name,
  )}&query_place_id=${encodeURIComponent(place.id)}`;

  const category = fallbackCategory || 'restaurant';
  const defaultCategoryLabels = {
    restaurant: 'Ресторан',
    bar: 'Бар',
    cafe: 'Кафе',
  };

  const location = place.location || null;
  const cityCenter = cityCenterLocation || null;
  const distanceKm = computeDistanceKm(cityCenter, location);
  const openingHours = extractOpeningHours(
    place.regularOpeningHours,
    place.utcOffsetMinutes,
  );

  return {
    placeId: place.id,
    name,
    category,
    categoryLabel:
      place.primaryTypeDisplayName?.text ||
      defaultCategoryLabels[category] ||
      'Заведение',
    photoUrl: photoUrls[0] || null,
    photoUrls,
    rating: typeof place.rating === 'number' ? place.rating : null,
    userRatingCount:
      typeof place.userRatingCount === 'number' ? place.userRatingCount : 0,
    priceSymbol: price.symbol,
    priceLabel: price.label,
    priceTier: price.tier,
    address,
    openNow:
      typeof place.regularOpeningHours?.openNow === 'boolean'
        ? place.regularOpeningHours.openNow
        : null,
    openingHours,
    location,
    cityCenter,
    distanceKm,
    mapsUrl: universalMapsUrl,
  };
}

async function googleSearchText(apiKey, body, fieldMask) {
  const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parsed = parseGoogleError(response.status, data);
    const err = new Error(
      parsed.message || 'Не удалось получить заведения из Google Places API (New).',
    );
    err.details = parsed;
    throw err;
  }
  return data;
}

async function resolveCity(apiKey, country, city, languageCode = 'ru', cityHint = null) {
  const cacheKey = `${country.toLowerCase().trim()}::${city.toLowerCase().trim()}`;
  if (cityCache.has(cacheKey)) {
    return cityCache.get(cacheKey);
  }

  if (
    cityHint &&
    cityHint.location &&
    typeof cityHint.location.latitude === 'number' &&
    typeof cityHint.location.longitude === 'number'
  ) {
    const hinted = {
      location: cityHint.location,
      viewport: isValidViewport(cityHint.viewport) ? cityHint.viewport : null,
    };
    cityCache.set(cacheKey, hinted);
    return hinted;
  }

  const data = await googleSearchText(
    apiKey,
    {
      textQuery: `${city}, ${country}`,
      languageCode,
      pageSize: 1,
    },
    CITY_FIELD_MASK,
  );

  const match = data?.places?.[0] || null;
  const resolved = {
    location: match?.location || null,
    viewport: isValidViewport(match?.viewport) ? match.viewport : null,
  };

  cityCache.set(cacheKey, resolved);
  return resolved;
}

async function discoverCityPlacesDirect({
  country,
  city,
  queryCountry,
  queryCity,
  category = 'all',
  pageTokens = {},
  discoveryRound = 0,
  cityHint = null,
  languageCode = 'ru',
}) {
  const apiKey = requireApiKey();
  const qCountry = String(queryCountry || country || '').trim();
  const qCity = String(queryCity || city || '').trim();
  const round = Math.max(0, Number(discoveryRound) || 0);
  const incomingTokens =
    pageTokens && typeof pageTokens === 'object' ? pageTokens : {};

  if (!qCountry || !qCity) {
    throw new Error('Не выбраны страна и город.');
  }

  const cityInfo = await resolveCity(
    apiKey,
    qCountry,
    qCity,
    languageCode,
    cityHint,
  );

  const baseCategories =
    category === 'all'
      ? ['restaurant', 'bar', 'cafe']
      : CATEGORY_CONFIG[category]
        ? [category]
        : ['restaurant', 'bar', 'cafe'];

  // When continuing pagination, ONLY query categories that still have a nextPageToken
  const hasIncomingTokens = Object.keys(incomingTokens).length > 0;
  const targetCategories = hasIncomingTokens
    ? baseCategories.filter((catKey) => Boolean(incomingTokens[catKey]))
    : baseCategories;

  const nextPageTokens = {};
  const categoryLists = await Promise.all(
    targetCategories.map(async (catKey) => {
      const cfg = CATEGORY_CONFIG[catKey];
      const queryBuilder = cfg.queries[round % cfg.queries.length];
      const textQuery = queryBuilder(qCity, qCountry);

      const requestPayload = {
        textQuery,
        includedType: cfg.includedType,
        strictTypeFiltering: true,
        languageCode,
        pageSize: 20,
      };

      if (cityInfo.viewport) {
        requestPayload.locationRestriction = {
          rectangle: cityInfo.viewport,
        };
      }

      if (incomingTokens[catKey]) {
        requestPayload.pageToken = incomingTokens[catKey];
      }

      const result = await googleSearchText(
        apiKey,
        requestPayload,
        DISCOVER_FIELD_MASK,
      );

      if (result?.nextPageToken) {
        nextPageTokens[catKey] = result.nextPageToken;
      }

      const rawPlaces = Array.isArray(result?.places) ? result.places : [];
      return rawPlaces
        .map((p) => normalizePlace(p, catKey, cityInfo.location))
        .filter(Boolean);
    }),
  );

  // Interleave restaurant -> bar -> cafe so the deck feels varied and balanced
  const seenInBatch = new Set();
  const interleaved = [];
  const maxLen = Math.max(0, ...categoryLists.map((l) => l.length));

  for (let i = 0; i < maxLen; i += 1) {
    for (const list of categoryLists) {
      const item = list[i];
      if (item && !seenInBatch.has(item.placeId)) {
        seenInBatch.add(item.placeId);
        interleaved.push(item);
      }
    }
  }

  return {
    city: cityInfo,
    places: interleaved,
    nextPageTokens,
    hasMorePages: Object.keys(nextPageTokens).length > 0,
  };
}

export async function fetchCitySuggestions(countryCode, query, signal) {
  const code = String(countryCode || '').trim().toLowerCase();
  const q = String(query || '').trim();
  if (q.length < 2 || !/^[a-z]{2}$/.test(code)) {
    return [];
  }

  const apiKey = getClientApiKey();
  if (!apiKey) return [];

  const languageCode = 'ru';
  const suggestKey = `${code}::${languageCode}::${q.toLowerCase()}`;
  if (citySuggestCache.has(suggestKey)) {
    return citySuggestCache.get(suggestKey);
  }

  const autoRes = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': AUTOCOMPLETE_FIELD_MASK,
    },
    body: JSON.stringify({
      input: q,
      includedPrimaryTypes: ['locality'],
      includedRegionCodes: [code],
      languageCode,
    }),
    signal,
  });

  if (!autoRes.ok) return [];
  const autoData = await autoRes.json().catch(() => ({}));
  const rawSuggestions = Array.isArray(autoData?.suggestions)
    ? autoData.suggestions
    : [];

  const seenNames = new Set();
  const cities = [];

  for (const item of rawSuggestions) {
    const pred = item?.placePrediction;
    const mainText = pred?.structuredFormat?.mainText?.text?.trim();
    const secondaryText = pred?.structuredFormat?.secondaryText?.text?.trim() || '';
    if (!mainText) continue;
    const lower = mainText.toLowerCase();
    if (seenNames.has(lower)) continue;
    seenNames.add(lower);
    cities.push({
      name: mainText,
      sublabel: secondaryText,
    });
  }

  citySuggestCache.set(suggestKey, cities);
  return cities;
}

export async function hydrateSavedPlaces(items) {
  if (!Array.isArray(items) || items.length === 0) return {};
  const apiKey = getClientApiKey();
  if (!apiKey) return {};

  const rawItems = items.slice(0, 30);
  const hydrated = {};

  await Promise.all(
    rawItems.map(async (item) => {
      const placeId = String(item?.placeId || '').trim();
      if (!placeId || placeId.startsWith('demo_') || !PLACE_ID_RE.test(placeId)) {
        return;
      }

      const country = String(item?.country || '').trim();
      const city = String(item?.city || '').trim();

      let cityCenter = null;
      if (country && city) {
        try {
          const cInfo = await resolveCity(apiKey, country, city, 'ru');
          cityCenter = cInfo?.location || null;
        } catch {
          cityCenter = null;
        }
      }

      let details = placeDetailsCache.get(placeId);
      if (!details) {
        const detRes = await fetch(
          `${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}?languageCode=ru`,
          {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': HYDRATE_FIELD_MASK,
            },
            priority: 'low',
          },
        );
        if (detRes.ok) {
          details = await detRes.json().catch(() => null);
          if (details) {
            placeDetailsCache.set(placeId, details);
          }
        }
      }

      if (!details) return;
      const location = details.location || null;
      const openingHours = extractOpeningHours(
        details.regularOpeningHours,
        details.utcOffsetMinutes,
      );
      const distanceKm = computeDistanceKm(cityCenter, location);

      hydrated[placeId] = {
        location,
        cityCenter,
        distanceKm,
        openingHours,
        openNow:
          typeof details.regularOpeningHours?.openNow === 'boolean'
            ? details.regularOpeningHours.openNow
            : null,
      };
    }),
  );

  return hydrated;
}

export class PlacesDeckSession {
  constructor(cityMeta, category = 'all') {
    this.cityMeta = cityMeta;
    this.category = category;
    this.cityKey = `${cityMeta.queryCountry.toLowerCase()}::${cityMeta.queryCity.toLowerCase()}::${category}`;

    const cached = storage.getCachedDeckState(cityMeta, category);
    this.pageTokens = cached.bucket.pageTokens;
    this.discoveryRound = cached.bucket.discoveryRound;
    this.exhausted = cached.bucket.exhausted;
    this.resolvedCity = cached.resolvedCity;
    this.inFlight = null;
    this.queuedIds = new Set(cached.places.map((p) => p.placeId));
  }

  /**
   * Returns any unswiped places still remaining in localStorage for the current batch.
   * As long as at least 1 card remains here, zero requests are made to Google Places API.
   */
  getRemainingCachedBatch() {
    const cached = storage.getCachedDeckState(this.cityMeta, this.category);
    this.pageTokens = cached.bucket.pageTokens;
    this.discoveryRound = cached.bucket.discoveryRound;
    this.exhausted = cached.bucket.exhausted;
    if (cached.resolvedCity) {
      this.resolvedCity = cached.resolvedCity;
    }
    for (const place of cached.places) {
      this.queuedIds.add(place.placeId);
    }
    return cached.places;
  }

  /**
   * Fetches the next batch of unswiped places directly from Google Places API (New) in the browser
   * ONLY after the current localStorage batch is completely swiped through.
   */
  async fetchNextUnseenBatch(minDesired = 1) {
    if (this.inFlight) return this.inFlight;

    this.inFlight = this._executeFetchLoop(minDesired).finally(() => {
      this.inFlight = null;
    });

    return this.inFlight;
  }

  async _executeFetchLoop(minDesired) {
    const freshPlaces = [];
    let hops = 0;

    while (freshPlaces.length < minDesired && !this.exhausted && hops < MAX_DISCOVERY_HOPS) {
      hops += 1;
      const payload = await discoverCityPlacesDirect({
        country: this.cityMeta.country,
        city: this.cityMeta.city,
        queryCountry: this.cityMeta.queryCountry,
        queryCity: this.cityMeta.queryCity,
        category: this.category,
        pageTokens: this.pageTokens,
        discoveryRound: this.discoveryRound,
        cityHint: this.resolvedCity || null,
        languageCode: 'ru',
      });

      if (payload.city) {
        this.resolvedCity = payload.city;
      }

      const rawPlaces = Array.isArray(payload.places) ? payload.places : [];
      const unseen = storage
        .filterUnswiped(rawPlaces)
        .filter((p) => !this.queuedIds.has(p.placeId));

      for (const place of unseen) {
        this.queuedIds.add(place.placeId);
        freshPlaces.push(place);
      }

      const nextTokens =
        payload.nextPageTokens && typeof payload.nextPageTokens === 'object'
          ? payload.nextPageTokens
          : {};

      if (Object.keys(nextTokens).length > 0) {
        this.pageTokens = nextTokens;
      } else {
        this.pageTokens = {};
        this.discoveryRound += 1;
        storage.setDiscoveryRound(this.cityKey, this.discoveryRound);

        if (rawPlaces.length === 0 && hops >= 2) {
          this.exhausted = true;
        }
        if (this.discoveryRound >= 8 && freshPlaces.length === 0) {
          this.exhausted = true;
        }
      }

      storage.saveFetchedDeckBatch(this.cityMeta, this.category, {
        places: rawPlaces,
        resolvedCity: this.resolvedCity,
        pageTokens: this.pageTokens,
        discoveryRound: this.discoveryRound,
        exhausted: this.exhausted,
      });
    }

    const cachedRemaining = storage.getCachedDeckState(this.cityMeta, this.category).places;
    return {
      city: this.resolvedCity,
      places: cachedRemaining.length > 0 ? cachedRemaining : freshPlaces,
      exhausted: this.exhausted,
    };
  }
}
