export const MAX_DISTANCE_SLIDER_VAL = 15.5;

/**
 * Great-circle Haversine distance between two { latitude, longitude } coordinates in km (rounded to 0.1 km).
 */
export function computeDistanceKm(locA, locB) {
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

function getVenueLocalDayAndMinute(openingHours, nowMs = Date.now()) {
  if (openingHours && typeof openingHours.utcOffsetMinutes === 'number') {
    const shifted = new Date(nowMs + openingHours.utcOffsetMinutes * 60_000);
    return {
      day: shifted.getUTCDay(),
      minuteOfDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    };
  }
  const local = new Date(nowMs);
  return {
    day: local.getDay(),
    minuteOfDay: local.getHours() * 60 + local.getMinutes(),
  };
}

function toWeekIntervals(periods) {
  const intervals = [];
  for (const p of periods) {
    if (!p?.open || typeof p.open.day !== 'number' || typeof p.open.hour !== 'number') {
      continue;
    }
    const start = p.open.day * 1440 + p.open.hour * 60 + (Number(p.open.minute) || 0);
    if (!p.close || typeof p.close.day !== 'number' || typeof p.close.hour !== 'number') {
      intervals.push([0, 10080]);
      continue;
    }
    let end = p.close.day * 1440 + p.close.hour * 60 + (Number(p.close.minute) || 0);
    if (end <= start) {
      end += 10080;
    }
    intervals.push([start, end]);
  }
  return intervals;
}

/**
 * Evaluates whether a place is currently open right now using its Google Places periods + timezone offset,
 * falling back gracefully to boolean openNow when detailed periods are unavailable.
 */
export function isPlaceOpenNow(item, nowMs = Date.now()) {
  const oh = item?.openingHours;
  if (oh && Array.isArray(oh.periods) && oh.periods.length > 0) {
    if (oh.periods.some((p) => !p.close)) {
      return true;
    }
    const { day, minuteOfDay } = getVenueLocalDayAndMinute(oh, nowMs);
    const nowWeekMin = day * 1440 + minuteOfDay;
    const intervals = toWeekIntervals(oh.periods);
    return intervals.some(
      ([start, end]) =>
        (nowWeekMin >= start && nowWeekMin < end) ||
        (nowWeekMin + 10080 >= start && nowWeekMin + 10080 < end),
    );
  }

  if (typeof oh?.openNowSnapshot === 'boolean') {
    return oh.openNowSnapshot;
  }
  if (typeof item?.openNow === 'boolean') {
    return item.openNow;
  }
  return null;
}

const HOURS_SLOT_WINDOWS = {
  morning: [7 * 60, 11 * 60], // 07:00 - 11:00
  day: [12 * 60, 17 * 60], // 12:00 - 17:00
  evening: [18 * 60, 22 * 60], // 18:00 - 22:00
  late: [23 * 60, 26 * 60], // 23:00 - 02:00
};

/**
 * Matches a saved place against the selected opening-hours filter:
 * - 'any'      -> all places
 * - 'open_now' -> currently open right now
 * - 'morning'  -> operates in 07:00-11:00 (>= 30m overlap)
 * - 'day'      -> operates in 12:00-17:00 (>= 30m overlap)
 * - 'evening'  -> operates in 18:00-22:00 (>= 30m overlap)
 * - 'late'     -> operates after 23:00 (>= 30m overlap or 24/7)
 */
export function doesPlaceMatchHoursFilter(item, hoursFilter, nowMs = Date.now()) {
  if (!hoursFilter || hoursFilter === 'any') {
    return true;
  }

  if (hoursFilter === 'open_now') {
    return isPlaceOpenNow(item, nowMs) === true;
  }

  const slotRange = HOURS_SLOT_WINDOWS[hoursFilter];
  if (!slotRange) return true;

  const oh = item?.openingHours;
  if (!oh || !Array.isArray(oh.periods) || oh.periods.length === 0) {
    return false;
  }

  if (oh.periods.some((p) => !p.close)) {
    return true;
  }

  const [winStart, winEnd] = slotRange;
  const intervals = toWeekIntervals(oh.periods);
  const MIN_OVERLAP_MINUTES = 30;

  for (let day = 0; day < 7; day += 1) {
    const targetStart = day * 1440 + winStart;
    const targetEnd = day * 1440 + winEnd;

    for (const [pStart, pEnd] of intervals) {
      for (const shift of [-10080, 0, 10080]) {
        const s = pStart + shift;
        const e = pEnd + shift;
        const overlap = Math.min(targetEnd, e) - Math.max(targetStart, s);
        if (overlap >= MIN_OVERLAP_MINUTES) {
          return true;
        }
      }
    }
  }

  return false;
}

function pad2(num) {
  return String(num).padStart(2, '0');
}

/**
 * Formats a concise human-readable opening hours summary for the venue's current local day.
 */
export function formatTodayHoursSummary(item, nowMs = Date.now()) {
  const openState = isPlaceOpenNow(item, nowMs);
  const oh = item?.openingHours;

  if (oh && Array.isArray(oh.periods) && oh.periods.length > 0) {
    if (oh.periods.some((p) => !p.close)) {
      return {
        isOpen: true,
        stateText: 'Круглосуточно',
        rangeText: '',
        label: 'Круглосуточно',
      };
    }

    const { day } = getVenueLocalDayAndMinute(oh, nowMs);
    const todaysPeriods = oh.periods.filter((p) => p.open?.day === day && p.close);

    if (todaysPeriods.length > 0) {
      const ranges = todaysPeriods
        .slice(0, 2)
        .map(
          (p) =>
            `${pad2(p.open.hour)}:${pad2(p.open.minute || 0)}-${pad2(p.close.hour)}:${pad2(
              p.close.minute || 0,
            )}`,
        )
        .join(', ');
      const stateText = openState ? 'Открыто' : 'Закрыто';
      return {
        isOpen: openState,
        stateText,
        rangeText: ranges,
        label: `${stateText} · ${ranges}`,
      };
    }

    const fallbackState = openState ? 'Открыто сейчас' : 'Сегодня выходной';
    return {
      isOpen: openState,
      stateText: fallbackState,
      rangeText: '',
      label: fallbackState,
    };
  }

  if (typeof openState === 'boolean') {
    const boolState = openState ? 'Открыто сейчас' : 'Сейчас закрыто';
    return {
      isOpen: openState,
      stateText: boolState,
      rangeText: '',
      label: boolState,
    };
  }

  return null;
}

export function formatCompactDistanceKm(distanceKm) {
  if (typeof distanceKm !== 'number' || Number.isNaN(distanceKm)) {
    return null;
  }
  if (distanceKm < 0.1) {
    return '< 0,1 км';
  }
  const formatted = distanceKm.toLocaleString('ru-RU', {
    minimumFractionDigits: distanceKm % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
  return `${formatted} км`;
}

export function formatDistanceKmLabel(distanceKm) {
  const compact = formatCompactDistanceKm(distanceKm);
  return compact ? `${compact} от центра` : null;
}

/**
 * Strips redundant trailing city, postal-code, and country segments from an address
 * so saved venue cards surface the scannable street name and building number first.
 */
export function formatCompactStreetAddress(address, knownTokens = []) {
  const raw = String(address || '').trim();
  if (!raw) return '';

  const normalizedSet = new Set(
    knownTokens
      .map((t) => String(t || '').trim().toLowerCase())
      .filter(Boolean),
  );

  const parts = raw
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    const withoutPostal = last
      .replace(/^[A-Z]{0,3}[-\s]?\d{3,6}\s*/i, '')
      .replace(/\s+[A-Z]{0,3}[-\s]?\d{3,6}$/i, '')
      .trim()
      .toLowerCase();

    if (!withoutPostal || normalizedSet.has(withoutPostal) || normalizedSet.has(last.toLowerCase())) {
      parts.pop();
    } else {
      break;
    }
  }

  return parts.join(', ');
}

export function formatSliderDistanceLabel(rawVal) {
  const num = Number(rawVal);
  if (!Number.isFinite(num) || num >= MAX_DISTANCE_SLIDER_VAL) {
    return 'Любое';
  }
  const formatted = num.toLocaleString('ru-RU', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
  return `до ${formatted} км`;
}

