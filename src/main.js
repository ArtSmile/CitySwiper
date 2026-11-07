import {
  COUNTRIES_CATALOG,
  QUICK_CITY_PICKS,
  buildDemoPlacesForCity,
  matchCatalogCountry,
  resolveCountryAndCityMeta,
} from './data/cities.js';
import { CardPhysicsController } from './physics/cardPhysics.js';
import {
  PlacesDeckSession,
  fetchCitySuggestions,
  hydrateSavedPlaces,
} from './services/placesApi.js';
import { storage } from './services/storage.js';
import {
  animateDropdownClose,
  animateDropdownOpen,
  animateFilterPanelState,
  bindAllTactileButtons,
  bindTactileButton,
  bumpSavedCounter,
  closeDialogAnimated,
  highlightActionButtons,
  hydrateLazyPhoto,
  openDialogAnimated,
  resetActionButtons,
  scrubBackgroundCards,
  settleStackCards,
  startLoadingPulse,
  stepCardPhotoCarousel,
} from './ui/animations.js';
import { ICONS } from './ui/icons.js';
import {
  MAX_DISTANCE_SLIDER_VAL,
  doesPlaceMatchHoursFilter,
  formatCompactDistanceKm,
  formatCompactStreetAddress,
  formatSliderDistanceLabel,
  formatTodayHoursSummary,
} from './utils/placeFilters.js';
import { createReactiveBackground } from './webgl/background.js';

const VISIBLE_STACK_LIMIT = 3;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCategoryIcon(category) {
  if (category === 'bar') return ICONS.wine;
  if (category === 'cafe') return ICONS.coffee;
  return ICONS.utensils;
}

// 1. Initialize WebGL Reactive Background (regl + Simplex Noise)
const bg = createReactiveBackground();

// 2. Grab Static DOM Nodes
const cityTriggerBtn = document.getElementById('city-trigger-btn');
const currentCityLabel = document.getElementById('current-city-label');
const savedTriggerBtn = document.getElementById('saved-trigger-btn');
const savedCountBadge = document.getElementById('saved-count-badge');
const categoryBar = document.getElementById('category-bar');
const deckStage = document.getElementById('deck-stage');

const cityDialog = document.getElementById('city-dialog');
const cityDialogPanel = document.getElementById('city-dialog-panel');
const cityDialogClose = document.getElementById('city-dialog-close');
const quickPicksGrid = document.getElementById('quick-picks-grid');
const cityForm = document.getElementById('city-form');
const countryComboRoot = document.getElementById('country-combo');
const countryInput = document.getElementById('country-input');
const countryToggleBtn = document.getElementById('country-toggle-btn');
const countryToggleIcon = document.getElementById('country-toggle-icon');
const countryListbox = document.getElementById('country-listbox');

const cityComboRoot = document.getElementById('city-combo');
const cityInput = document.getElementById('city-input');
const cityToggleBtn = document.getElementById('city-toggle-btn');
const cityToggleIcon = document.getElementById('city-toggle-icon');
const cityListbox = document.getElementById('city-listbox');
const cityFormError = document.getElementById('city-form-error');

const savedDialog = document.getElementById('saved-dialog');
const savedDialogPanel = document.getElementById('saved-dialog-panel');
const savedDialogSubtitle = document.getElementById('saved-dialog-subtitle');
const savedDialogClose = document.getElementById('saved-dialog-close');
const savedTabs = document.getElementById('saved-tabs');
const savedFiltersToggle = document.getElementById('saved-filters-toggle');
const savedFiltersIcon = document.getElementById('saved-filters-icon');
const savedFiltersBadge = document.getElementById('saved-filters-badge');
const savedFiltersChevron = document.getElementById('saved-filters-chevron');
const savedFiltersReset = document.getElementById('saved-filters-reset');
const savedFiltersPanel = document.getElementById('saved-filters-panel');
const savedTypeChips = document.getElementById('saved-type-chips');
const savedHoursChips = document.getElementById('saved-hours-chips');
const savedDistanceRange = document.getElementById('saved-distance-range');
const savedDistanceOutput = document.getElementById('saved-distance-output');
const savedListEl = document.getElementById('saved-list');

const actionButtons = {
  left: document.getElementById('btn-swipe-left'),
  down: document.getElementById('btn-swipe-down'),
  up: document.getElementById('btn-swipe-up'),
  right: document.getElementById('btn-swipe-right'),
};

// Inject static vector icons
document.getElementById('city-pill-icon').innerHTML = ICONS.mapPin;
document.getElementById('city-pill-chevron').innerHTML = ICONS.chevronDown;
document.getElementById('saved-pill-icon').innerHTML = ICONS.bookmark;
countryToggleIcon.innerHTML = ICONS.chevronDown;
cityToggleIcon.innerHTML = ICONS.chevronDown;
cityDialogClose.innerHTML = ICONS.close;
savedDialogClose.innerHTML = ICONS.close;
savedFiltersIcon.innerHTML = ICONS.sliders;
savedFiltersChevron.innerHTML = ICONS.chevronDown;
const savedChevronSvg = savedFiltersChevron.querySelector('svg') || savedFiltersChevron;
savedChevronSvg.style.transform = 'rotate(180deg)';
document.querySelectorAll('[data-icon-slot]').forEach((slot) => {
  const key = slot.dataset.iconSlot;
  if (ICONS[key]) slot.innerHTML = ICONS[key];
});

bindAllTactileButtons(document);

// 3. Application State
let activeCityMeta = storage.getSelectedCity();
let activeCategory = 'all';
let savedFilter = 'all';
let savedTypeFilter = 'all';
let savedHoursFilter = 'any';
let savedMaxDistanceKm = MAX_DISTANCE_SLIDER_VAL;
let savedFiltersExpanded = true;
let hydrateSavedInFlight = false;
let savedThumbObserver = null;
let session = null;
let deckQueue = []; // Unswiped Place objects waiting in the deck
let mountedCards = []; // [{ place, el }] up to VISIBLE_STACK_LIMIT

// 4. Planck.js Card Physics Controller
function warmNextCardCoverPhoto() {
  const nextCardEl = mountedCards[1]?.el;
  if (!nextCardEl) return;
  const nextCoverImg =
    nextCardEl.querySelector('.venue-slide.is-active .venue-photo') ||
    nextCardEl.querySelector('.venue-photo');
  if (nextCoverImg) {
    hydrateLazyPhoto(nextCoverImg, { priority: 'low', fadeIn: false });
  }
}

const physics = new CardPhysicsController({
  onDragProgress({ nx, ny, direction, intensity, progress, committed }) {
    if (!committed) {
      if (progress > 0.015) {
        warmNextCardCoverPhoto();
      }
      bg.setDragVector(nx, ny);
      highlightActionButtons(actionButtons, direction, intensity);
      const cardEls = mountedCards.map((c) => c.el);
      scrubBackgroundCards(cardEls, progress);
    } else {
      bg.setDragVector(0, 0);
      resetActionButtons(actionButtons);
    }
  },
  onSwipeCommit(direction) {
    handleCardCommitted(direction);
  },
  onCardTap({ cardEl, side }) {
    stepCardPhotoCarousel(cardEl, side);
  },
});

function updateSavedCounter(animateBump = false) {
  const count = storage.getSavedPlaces().length;
  savedCountBadge.textContent = String(count);
  if (animateBump) {
    bumpSavedCounter(savedCountBadge);
  }
}

function setActionDockEnabled(enabled) {
  for (const btn of Object.values(actionButtons)) {
    if (!btn) continue;
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.42';
  }
}

// 5. Venue Card DOM Factory
function createVenueCardElement(place, depthIndex) {
  const card = document.createElement('article');
  card.className = `venue-card${depthIndex > 0 ? ' venue-card--background' : ''}`;
  card.dataset.placeId = place.placeId;
  card.style.zIndex = String(30 - depthIndex * 10);

  const isTopLcpCard = depthIndex === 0;
  const photos =
    Array.isArray(place.photoUrls) && place.photoUrls.length > 0
      ? place.photoUrls.slice(0, 5)
      : place.photoUrl
        ? [place.photoUrl]
        : [];

  // Defer ALL Google Photos API requests via data-photo-src until the slide actually becomes visible
  const mediaHtml =
    photos.length > 0
      ? `<div class="venue-carousel" data-active-slide="0">
          ${photos
            .map(
              (url, idx) => `<div class="venue-slide${idx === 0 ? ' is-active' : ''}" data-slide-idx="${idx}">
                <img
                  class="venue-photo"
                  data-photo-src="${escapeHtml(url)}"
                  alt="${escapeHtml(place.name)} - фото ${idx + 1}"
                  decoding="async"
                  width="720"
                  height="900"
                />
              </div>`,
            )
            .join('')}
        </div>`
      : `<div class="venue-photo-slot">
          <div class="venue-photo-fallback">
            ${getCategoryIcon(place.category)}
            <span>Фото не предоставлено</span>
          </div>
        </div>`;

  const storiesBarHtml =
    photos.length > 1
      ? `<div class="venue-stories-bar" aria-hidden="true">
          ${photos
            .map(
              (_, idx) => `<span class="venue-story-segment">
                <span class="venue-story-fill${idx === 0 ? ' is-active' : ''}"></span>
              </span>`,
            )
            .join('')}
        </div>`
      : '';

  const statusHtml =
    place.openNow === null
      ? place.isDemo
        ? `<span class="venue-status-pill">Демо-режим</span>`
        : ''
      : `<span class="venue-status-pill">
          <span class="status-dot${place.openNow ? '' : ' status-dot--closed'}"></span>
          ${place.openNow ? 'Открыто' : 'Закрыто'}
        </span>`;

  const ratingHtml =
    place.rating !== null
      ? `<span class="metric-chip">
          ${ICONS.starFilled}
          <span>${place.rating.toFixed(1)}</span>
          ${
            place.userRatingCount > 0
              ? `<span class="metric-sub">(${place.userRatingCount.toLocaleString('ru-RU')})</span>`
              : ''
          }
        </span>`
      : `<span class="metric-chip"><span class="metric-sub">Новое место</span></span>`;

  const priceHtml = `<span class="metric-chip">
      <span>${escapeHtml(place.priceSymbol)}</span>
      <span class="metric-sub">· ${escapeHtml(place.priceLabel)}</span>
    </span>`;

  card.innerHTML = `
    <div class="venue-card-surface">
      <div class="venue-media">
        ${mediaHtml}
        <div class="venue-scrim"></div>

        <div class="swipe-stamp swipe-stamp--right" data-stamp="right">Хочу</div>
        <div class="swipe-stamp swipe-stamp--left" data-stamp="left">Не моё</div>
        <div class="swipe-stamp swipe-stamp--up" data-stamp="up">В избранное ★</div>
        <div class="swipe-stamp swipe-stamp--down" data-stamp="down">Уже бывал ↓</div>

        <div class="venue-top-row">
          <span class="venue-type-badge">
            ${getCategoryIcon(place.category)}
            <span>${escapeHtml(place.categoryLabel)}</span>
          </span>
          ${statusHtml}
        </div>

        ${storiesBarHtml}
      </div>

      <div class="venue-body">
        <h2 class="venue-title">${escapeHtml(place.name)}</h2>
        <div class="venue-metrics-row">
          ${ratingHtml}
          ${priceHtml}
        </div>
        <p class="venue-address">
          ${ICONS.mapPin}
          <span>${escapeHtml(place.address)}</span>
        </p>
        <a
          class="open-maps-btn tactile-link"
          href="${escapeHtml(place.mapsUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          data-no-drag="true"
        >
          <span class="open-maps-lead">
            ${ICONS.externalMaps}
            <span>Open in Maps</span>
          </span>
          <span class="open-maps-arrow">${ICONS.arrowUpRight}</span>
        </a>
      </div>
    </div>
  `;

  // Graceful per-slide image fallback if any Google photo link fails to load
  card.querySelectorAll('.venue-slide .venue-photo').forEach((imgEl) => {
    imgEl.addEventListener(
      'error',
      () => {
        const slideEl = imgEl.closest('.venue-slide');
        if (slideEl) {
          slideEl.innerHTML = `<div class="venue-photo-fallback">
            ${getCategoryIcon(place.category)}
            <span>${escapeHtml(place.categoryLabel)}</span>
          </div>`;
        }
      },
      { once: true },
    );
  });

  // Hydrate ONLY Slide 0 of the active top card; carousel slides 1..4 and occluded background cards stay lazy
  if (isTopLcpCard) {
    const heroImg = card.querySelector('.venue-slide.is-active .venue-photo');
    if (heroImg) {
      hydrateLazyPhoto(heroImg, { priority: 'high', fadeIn: false });
    }
  }

  const mapsLink = card.querySelector('.open-maps-btn');
  bindTactileButton(mapsLink, 0.985);

  return card;
}

// 6. Stack Mounting & Promotion
function renderInitialStack() {
  physics.detachActiveCard(true);
  deckStage.innerHTML = '';
  mountedCards = [];

  if (deckQueue.length === 0) {
    setActionDockEnabled(false);
    renderEmptyDeckState();
    return;
  }

  const count = Math.min(VISIBLE_STACK_LIMIT, deckQueue.length);
  for (let i = 0; i < count; i += 1) {
    const place = deckQueue[i];
    const el = createVenueCardElement(place, i);
    mountedCards.push({ place, el });
    deckStage.appendChild(el);
  }

  const cardEls = mountedCards.map((m) => m.el);
  settleStackCards(cardEls, true);
  physics.attachCard(mountedCards[0].el);
  setActionDockEnabled(true);
}

function handleCardCommitted(direction) {
  const swipedItem = mountedCards.shift();
  if (swipedItem) {
    swipedItem.el.style.zIndex = '45';
    deckQueue.shift();
    storage.recordSwipe(swipedItem.place, direction, activeCityMeta);
    bg.pulseDirection(direction);

    if (direction === 'right' || direction === 'up') {
      updateSavedCounter(true);
    }
  }

  // Mount next queued card underneath if available
  const nextQueueIndex = mountedCards.length;
  if (deckQueue[nextQueueIndex]) {
    const nextPlace = deckQueue[nextQueueIndex];
    const newEl = createVenueCardElement(nextPlace, nextQueueIndex);
    mountedCards.push({ place: nextPlace, el: newEl });
    deckStage.appendChild(newEl);
  }

  if (mountedCards.length > 0) {
    mountedCards.forEach((item, idx) => {
      item.el.style.zIndex = String(30 - idx * 10);
      if (idx === 0) {
        item.el.classList.remove('venue-card--background');
        // Hydrate ONLY the cover slide of the newly promoted card; slides 1..4 stay lazy until tapped
        const activeImg =
          item.el.querySelector('.venue-slide.is-active .venue-photo') ||
          item.el.querySelector('.venue-photo');
        if (activeImg) {
          hydrateLazyPhoto(activeImg, { priority: 'high', fadeIn: false });
        }
      }
    });

    const cardEls = mountedCards.map((m) => m.el);
    settleStackCards(cardEls, false);
    physics.attachCard(mountedCards[0].el);
    setActionDockEnabled(true);
    return;
  }

  // Current localStorage batch has now been swiped completely to the end (0 cards left)
  setActionDockEnabled(false);
  if (session && !session.exhausted) {
    renderLoadingSkeleton();
    fetchNextBatchWhenDepleted();
  } else {
    renderEmptyDeckState();
  }
}

async function fetchNextBatchWhenDepleted() {
  if (!session) return;
  const activeSession = session;
  try {
    const { places } = await activeSession.fetchNextUnseenBatch(1);
    if (activeSession !== session) return;

    deckQueue = places.filter((p) => !storage.hasSwiped(p.placeId));
    if (deckQueue.length > 0) {
      renderInitialStack();
    } else {
      renderEmptyDeckState();
    }
  } catch (err) {
    if (activeSession !== session) return;
    renderApiErrorState(err);
  }
}

// 7. Loading, Empty & API Error States
function renderLoadingSkeleton() {
  physics.detachActiveCard(true);
  mountedCards = [];
  setActionDockEnabled(false);

  deckStage.innerHTML = `
    <div class="state-card skeleton-card" id="loading-skeleton">
      <div class="skel-media" data-pulse>
        <div class="skel-pill"></div>
      </div>
      <div class="skel-body">
        <div class="skel-line skel-title" data-pulse></div>
        <div class="skel-line skel-meta" data-pulse></div>
        <div class="skel-line skel-addr" data-pulse></div>
        <div class="skel-line skel-btn" data-pulse></div>
      </div>
    </div>
  `;
  startLoadingPulse(deckStage);
}

function renderEmptyDeckState() {
  const cityTitle = activeCityMeta ? activeCityMeta.city : 'этом городе';
  deckStage.innerHTML = `
    <div class="state-card">
      <h3 class="state-title">Вы просмотрели свежие места в ${escapeHtml(cityTitle)}</h3>
      <p class="state-desc">
        Все просвайпанные карточки сохранены в памяти браузера, поэтому повторы скрыты. Попробуйте сменить категорию, выбрать другой город или сбросить историю для этого города.
      </p>
      <div class="state-actions">
        <button type="button" class="state-btn-primary" id="btn-empty-change-city">
          Выбрать другой город
        </button>
        <button type="button" class="state-btn-secondary" id="btn-empty-reset-city">
          ${ICONS.refresh}
          <span>Сбросить просмотренные в ${escapeHtml(cityTitle)}</span>
        </button>
      </div>
    </div>
  `;

  const changeBtn = document.getElementById('btn-empty-change-city');
  const resetBtn = document.getElementById('btn-empty-reset-city');
  bindTactileButton(changeBtn);
  bindTactileButton(resetBtn);

  changeBtn?.addEventListener('click', () => openCityModal(true));
  resetBtn?.addEventListener('click', () => {
    if (activeCityMeta) {
      storage.clearCitySwipeHistory(activeCityMeta.city, activeCityMeta);
      loadCityDeck(activeCityMeta);
    }
  });
}

function renderApiErrorState(error) {
  physics.detachActiveCard(true);
  mountedCards = [];
  setActionDockEnabled(false);

  const details = error?.details || {};
  const isServiceDisabled =
    details.reason === 'SERVICE_DISABLED' ||
    String(error?.message || '').includes('Places API (New) has not been used');

  const activationHtml = details.activationUrl
    ? `<a
        class="state-btn-primary tactile-link"
        href="${escapeHtml(details.activationUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Включить Places API (New)</span>
        ${ICONS.arrowUpRight}
      </a>`
    : '';

  const title = isServiceDisabled
    ? 'Включите Places API (New) в Google Cloud'
    : 'Не удалось загрузить места';

  const desc = isServiceDisabled
    ? 'Ключ из .env подключён успешно, но в вашем проекте Google Cloud ещё не активирован сервис Places API (New). Активируйте его по ссылке ниже и нажмите «Повторить запрос».'
    : error?.message || 'Проверьте интернет-соединение или настройки ключа в .env.';

  deckStage.innerHTML = `
    <div class="state-card">
      <h3 class="state-title">${escapeHtml(title)}</h3>
      <p class="state-desc">${escapeHtml(desc)}</p>
      <div class="state-actions">
        ${activationHtml}
        <button type="button" class="${
          details.activationUrl ? 'state-btn-secondary' : 'state-btn-primary'
        }" id="btn-retry-live-api">
          ${ICONS.refresh}
          <span>Повторить живой запрос</span>
        </button>
        <button type="button" class="state-btn-secondary" id="btn-preview-demo-deck">
          <span>Проверить свайпы на демо-колоде</span>
        </button>
      </div>
    </div>
  `;

  bindAllTactileButtons(deckStage);

  document.getElementById('btn-retry-live-api')?.addEventListener('click', () => {
    if (activeCityMeta) {
      loadCityDeck(activeCityMeta);
    }
  });

  document.getElementById('btn-preview-demo-deck')?.addEventListener('click', () => {
    if (!activeCityMeta) return;
    session = null;
    deckQueue = storage.filterUnswiped(buildDemoPlacesForCity(activeCityMeta));
    if (deckQueue.length === 0) {
      storage.clearCitySwipeHistory(activeCityMeta.city);
      deckQueue = storage.filterUnswiped(buildDemoPlacesForCity(activeCityMeta));
    }
    renderInitialStack();
  });
}

// 8. Live City Deck Loader (restores remaining localStorage batch with 0 Google API calls)
async function loadCityDeck(cityMeta) {
  activeCityMeta = cityMeta;
  storage.setSelectedCity(cityMeta);
  currentCityLabel.textContent = `${cityMeta.city}, ${cityMeta.country}`;

  const nextSession = new PlacesDeckSession(cityMeta, activeCategory);
  session = nextSession;

  const cachedBatch = nextSession.getRemainingCachedBatch();
  if (cachedBatch.length > 0) {
    deckQueue = cachedBatch;
    renderInitialStack();
    return;
  }

  if (nextSession.exhausted) {
    deckQueue = [];
    renderEmptyDeckState();
    return;
  }

  renderLoadingSkeleton();
  deckQueue = [];

  try {
    const { places } = await nextSession.fetchNextUnseenBatch(1);
    if (session !== nextSession) return;
    deckQueue = places;
    renderInitialStack();
  } catch (err) {
    if (session !== nextSession) return;
    renderApiErrorState(err);
  }
}

// 9. Country & City Modal + Accessible Combobox Dropdowns
let lastComboEscapeAt = 0;
const liveCitySuggestCache = new Map();
let citySuggestTimer = 0;
let citySuggestAbort = null;

function syncQuickPickSelection(countryVal, cityVal) {
  const chips = quickPicksGrid.querySelectorAll('.quick-pick-chip');
  chips.forEach((chip, idx) => {
    const pick = QUICK_CITY_PICKS[idx];
    const isMatch =
      pick &&
      pick.country.toLowerCase() === String(countryVal || '').trim().toLowerCase() &&
      pick.city.toLowerCase() === String(cityVal || '').trim().toLowerCase();
    chip.classList.toggle('is-selected', Boolean(isMatch));
  });
}

function createComboboxController({
  idPrefix,
  rootEl,
  inputEl,
  toggleBtn,
  toggleIconEl,
  listboxEl,
  getOptions,
  isOptionSelected,
  onSelect,
  onBeforeOpen,
}) {
  const state = {
    isOpen: false,
    openUp: false,
    mode: 'all', // 'all' | 'filter'
    items: [],
    activeIndex: -1,
  };

  const renderItems = () => {
    state.items = getOptions(state.mode, inputEl.value);
    const selectedIdx = state.items.findIndex(
      (item) => !item.disabled && isOptionSelected(item),
    );
    if (state.activeIndex >= state.items.length) {
      state.activeIndex = state.items.length - 1;
    }
    if (state.activeIndex >= 0 && state.items[state.activeIndex]?.disabled) {
      state.activeIndex = -1;
    }

    listboxEl.innerHTML = state.items
      .map((item, idx) => {
        const isDisabled = Boolean(item.disabled);
        const selected = !isDisabled && idx === selectedIdx;
        const highlighted = !isDisabled && idx === state.activeIndex;
        const optId = `${idPrefix}-opt-${idx}`;
        return `<li
          class="combo-option${highlighted ? ' is-highlighted' : ''}"
          id="${optId}"
          role="option"
          data-option-idx="${idx}"
          aria-selected="${selected ? 'true' : 'false'}"
          ${isDisabled ? 'aria-disabled="true"' : ''}
        >
          <span class="combo-option-text">
            <span class="combo-option-label">${escapeHtml(item.label)}</span>
            ${
              item.sublabel
                ? `<span class="combo-option-sub">${escapeHtml(item.sublabel)}</span>`
                : ''
            }
          </span>
          ${selected ? `<span class="combo-option-check">${ICONS.check}</span>` : ''}
        </li>`;
      })
      .join('');

    if (
      state.activeIndex >= 0 &&
      state.items[state.activeIndex] &&
      !state.items[state.activeIndex].disabled
    ) {
      inputEl.setAttribute('aria-activedescendant', `${idPrefix}-opt-${state.activeIndex}`);
    } else {
      inputEl.removeAttribute('aria-activedescendant');
    }

    return selectedIdx;
  };

  const computePlacement = () => {
    const panelRect = cityDialogPanel.getBoundingClientRect();
    const ctrlRect = rootEl.getBoundingClientRect();
    const spaceBelow = panelRect.bottom - ctrlRect.bottom - 14;
    const spaceAbove = ctrlRect.top - panelRect.top - 14;
    const openUp = spaceBelow < 185 && spaceAbove > spaceBelow;
    const avail = openUp ? spaceAbove : spaceBelow;
    const maxH = Math.max(132, Math.min(204, Math.floor(avail)));

    state.openUp = openUp;
    listboxEl.classList.toggle('combo-dropdown--up', openUp);
    listboxEl.style.maxHeight = `${maxH}px`;
  };

  const setHighlight = (nextIdx, scrollIntoView = true) => {
    const selectableCount = state.items.filter((it) => !it.disabled).length;
    if (!selectableCount) {
      state.activeIndex = -1;
      inputEl.removeAttribute('aria-activedescendant');
      return;
    }
    const count = state.items.length;
    let candidate = ((nextIdx % count) + count) % count;
    let safety = 0;
    while (state.items[candidate]?.disabled && safety < count) {
      candidate = (candidate + 1) % count;
      safety += 1;
    }
    state.activeIndex = candidate;
    const optEls = listboxEl.querySelectorAll('.combo-option');
    optEls.forEach((el, idx) => {
      el.classList.toggle('is-highlighted', idx === state.activeIndex);
    });
    const activeEl = optEls[state.activeIndex];
    if (activeEl) {
      inputEl.setAttribute('aria-activedescendant', activeEl.id);
      if (scrollIntoView) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const open = (mode = 'all') => {
    if (inputEl.disabled) return;

    if (state.isOpen && state.mode === mode) {
      renderItems();
      computePlacement();
      return;
    }

    onBeforeOpen?.();
    const wasOpen = state.isOpen;
    state.isOpen = true;
    state.mode = mode;
    state.activeIndex = mode === 'filter' ? 0 : -1;

    const selectedIdx = renderItems();
    if (mode === 'all' && selectedIdx >= 0) {
      state.activeIndex = selectedIdx;
    }

    rootEl.classList.add('is-open');
    inputEl.setAttribute('aria-expanded', 'true');
    computePlacement();

    if (!wasOpen) {
      const chevronSvg = toggleIconEl.querySelector('svg') || toggleIconEl;
      animateDropdownOpen(listboxEl, chevronSvg, state.openUp);
    }

    if (selectedIdx >= 0) {
      const selectedEl = listboxEl.querySelector(`[data-option-idx="${selectedIdx}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    } else {
      listboxEl.scrollTop = 0;
    }
  };

  const close = (immediate = false) => {
    if (!state.isOpen && listboxEl.hidden) return;
    state.isOpen = false;
    state.activeIndex = -1;
    rootEl.classList.remove('is-open');
    inputEl.setAttribute('aria-expanded', 'false');
    inputEl.removeAttribute('aria-activedescendant');

    const chevronSvg = toggleIconEl.querySelector('svg') || toggleIconEl;
    if (immediate) {
      listboxEl.hidden = true;
      listboxEl.style.transform = '';
      listboxEl.style.opacity = '';
      chevronSvg.style.transform = '';
      return;
    }

    animateDropdownClose(listboxEl, chevronSvg, state.openUp, () => !state.isOpen);
  };

  const refresh = () => {
    if (!state.isOpen || inputEl.disabled) return;
    renderItems();
    computePlacement();
  };

  const commitOption = (idx) => {
    const item = state.items[idx];
    if (!item || item.disabled) return;
    onSelect(item);
    close(false);
  };

  // Toggle button opens full list or closes active dropdown without blurring input
  toggleBtn.addEventListener('pointerdown', (e) => {
    if (toggleBtn.disabled) return;
    e.preventDefault();
  });

  toggleBtn.addEventListener('click', () => {
    if (inputEl.disabled || toggleBtn.disabled) return;
    if (state.isOpen) {
      close(false);
    } else {
      inputEl.focus({ preventScroll: true });
      open('all');
    }
  });

  // Focusing or clicking the input opens full unfiltered list so pre-filled values never block browsing
  inputEl.addEventListener('focus', () => {
    if (!cityDialog.open || inputEl.disabled) return;
    if (!state.isOpen) {
      open('all');
    }
  });

  inputEl.addEventListener('click', () => {
    if (inputEl.disabled) return;
    if (!state.isOpen) {
      open('all');
    }
  });

  inputEl.addEventListener('input', () => {
    if (inputEl.disabled) return;
    cityFormError.textContent = '';
    open('filter');
    syncQuickPickSelection(countryInput.value, cityInput.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (inputEl.disabled || e.isComposing) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!state.isOpen) {
        open('all');
      } else {
        setHighlight(state.activeIndex + 1);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!state.isOpen) {
        open('all');
      } else {
        setHighlight(state.activeIndex <= 0 ? state.items.length - 1 : state.activeIndex - 1);
      }
      return;
    }

    if (
      e.key === 'Enter' &&
      state.isOpen &&
      state.activeIndex >= 0 &&
      state.items[state.activeIndex] &&
      !state.items[state.activeIndex].disabled
    ) {
      e.preventDefault();
      commitOption(state.activeIndex);
      return;
    }

    if (e.key === 'Escape' && state.isOpen) {
      e.preventDefault();
      e.stopPropagation();
      lastComboEscapeAt = performance.now();
      close(false);
      return;
    }

    if (e.key === 'Tab' && state.isOpen) {
      close(false);
    }
  });

  // Prevent mouse click on option from blurring input before click fires; allow touch pan-y scrolling
  listboxEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.target.closest('[data-option-idx]')) {
      e.preventDefault();
    }
  });

  listboxEl.addEventListener('click', (e) => {
    const optEl = e.target.closest('[data-option-idx]');
    if (!optEl) return;
    commitOption(Number(optEl.dataset.optionIdx));
  });

  return {
    open,
    close,
    refresh,
    get isOpen() {
      return state.isOpen;
    },
  };
}

let countryCombo = null;
let cityCombo = null;

function closeAllCombos(immediate = false) {
  countryCombo?.close(immediate);
  cityCombo?.close(immediate);
}

function doesCityBelongToCountry(matchedCountry, rawCity) {
  if (!matchedCountry) return false;
  const cityLower = String(rawCity || '').trim().toLowerCase();
  if (!cityLower) return false;

  if (
    matchedCountry.cities.some(
      (ct) =>
        ct.name.toLowerCase() === cityLower || ct.queryName.toLowerCase() === cityLower,
    )
  ) {
    return true;
  }

  for (const [cacheKey, list] of liveCitySuggestCache.entries()) {
    if (cacheKey.startsWith(`${matchedCountry.code.toLowerCase()}::`)) {
      if (list.some((item) => item.name.toLowerCase() === cityLower)) {
        return true;
      }
    }
  }

  if (
    activeCityMeta &&
    activeCityMeta.country.toLowerCase() === matchedCountry.name.toLowerCase() &&
    activeCityMeta.city.toLowerCase() === cityLower
  ) {
    return true;
  }

  return false;
}

function syncCityFieldState() {
  const matchedCountry = matchCatalogCountry(countryInput.value);
  const isEnabled = Boolean(matchedCountry);

  cityInput.disabled = !isEnabled;
  cityToggleBtn.disabled = !isEnabled;
  cityComboRoot.classList.toggle('is-disabled', !isEnabled);
  cityInput.placeholder = isEnabled
    ? 'Выберите или введите город'
    : 'Сначала выберите страну';

  if (!isEnabled) {
    cityCombo?.close(true);
  }

  return matchedCountry;
}

countryCombo = createComboboxController({
  idPrefix: 'country',
  rootEl: countryComboRoot,
  inputEl: countryInput,
  toggleBtn: countryToggleBtn,
  toggleIconEl: countryToggleIcon,
  listboxEl: countryListbox,
  onBeforeOpen: () => cityCombo?.close(false),
  isOptionSelected: (item) => {
    const matched = matchCatalogCountry(countryInput.value);
    return Boolean(matched && matched.code === item.code);
  },
  getOptions: (mode, rawVal) => {
    // COUNTRIES_CATALOG is pre-sorted strictly alphabetically via Intl.Collator('ru')
    const base = COUNTRIES_CATALOG.map((c) => ({
      code: c.code,
      label: c.name,
      sublabel: c.queryName,
      countryName: c.name,
      aliases: c.aliases || [],
      cities: c.cities,
    }));

    const q = String(rawVal || '').trim().toLowerCase();
    if (mode !== 'filter' || !q) {
      return base;
    }

    const filtered = base.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel.toLowerCase().includes(q) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(q)),
    );

    if (filtered.length > 0) {
      return filtered;
    }

    return [
      {
        label: 'Страна не найдена в списке',
        sublabel: '',
        disabled: true,
      },
    ];
  },
  onSelect: (item) => {
    countryInput.value = item.countryName;
    const matchedCountry = syncCityFieldState();

    if (matchedCountry && !doesCityBelongToCountry(matchedCountry, cityInput.value)) {
      cityInput.value = '';
    }

    cityFormError.textContent = '';
    syncQuickPickSelection(countryInput.value, cityInput.value);
  },
});

// Keep City input disabled whenever Country input is cleared or edited to an unselected string
countryInput.addEventListener('input', () => {
  const matchedCountry = syncCityFieldState();
  if (!matchedCountry) {
    if (cityInput.value) {
      cityInput.value = '';
    }
  } else if (!doesCityBelongToCountry(matchedCountry, cityInput.value)) {
    cityInput.value = '';
  }
  syncQuickPickSelection(countryInput.value, cityInput.value);
});

cityCombo = createComboboxController({
  idPrefix: 'city',
  rootEl: cityComboRoot,
  inputEl: cityInput,
  toggleBtn: cityToggleBtn,
  toggleIconEl: cityToggleIcon,
  listboxEl: cityListbox,
  onBeforeOpen: () => countryCombo?.close(false),
  isOptionSelected: (item) =>
    !item.isCustom &&
    item.cityName.toLowerCase() === cityInput.value.trim().toLowerCase(),
  getOptions: (mode, rawVal) => {
    const matchedCountry = matchCatalogCountry(countryInput.value);
    if (!matchedCountry) return [];

    const base = matchedCountry.cities.map((ct) => ({
      label: ct.name,
      sublabel: ct.queryName,
      queryName: ct.queryName,
      cityName: ct.name,
      countryName: matchedCountry.name,
    }));

    const q = String(rawVal || '').trim().toLowerCase();
    if (mode !== 'filter' || !q) {
      return base;
    }

    const filtered = base.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel.toLowerCase().includes(q) ||
        (item.queryName && item.queryName.toLowerCase().includes(q)),
    );

    const seenNames = new Set(filtered.map((it) => it.cityName.toLowerCase()));
    const liveKey = `${matchedCountry.code.toLowerCase()}::${q}`;
    const liveMatches = liveCitySuggestCache.get(liveKey) || [];

    for (const liveCity of liveMatches) {
      const lower = liveCity.name.toLowerCase();
      if (seenNames.has(lower)) continue;
      seenNames.add(lower);
      filtered.push({
        label: liveCity.name,
        sublabel: liveCity.sublabel || matchedCountry.name,
        queryName: liveCity.name,
        cityName: liveCity.name,
        countryName: matchedCountry.name,
      });
    }

    if (filtered.length > 0) {
      return filtered;
    }

    const trimmed = String(rawVal || '').trim();
    return [
      {
        label: trimmed,
        sublabel: 'Поиск по Google Maps',
        cityName: trimmed,
        countryName: matchedCountry.name,
        isCustom: true,
      },
    ];
  },
  onSelect: (item) => {
    cityInput.value = item.cityName;
    cityFormError.textContent = '';
    syncQuickPickSelection(countryInput.value, cityInput.value);
  },
});

cityInput.addEventListener('input', () => {
  window.clearTimeout(citySuggestTimer);
  citySuggestAbort?.abort();
  if (cityInput.disabled) return;

  const matchedCountry = matchCatalogCountry(countryInput.value);
  const query = cityInput.value.trim();
  if (!matchedCountry || query.length < 2) return;

  const cacheKey = `${matchedCountry.code.toLowerCase()}::${query.toLowerCase()}`;
  if (liveCitySuggestCache.has(cacheKey)) {
    cityCombo?.refresh();
    return;
  }

  citySuggestTimer = window.setTimeout(async () => {
    const controller = new AbortController();
    citySuggestAbort = controller;
    try {
      const results = await fetchCitySuggestions(
        matchedCountry.code,
        query,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      liveCitySuggestCache.set(cacheKey, results);
      cityCombo?.refresh();
    } catch {
      // Ignore aborted or transient suggest requests; custom fallback remains available
    }
  }, 160);
});

function populateCountriesCatalog() {
  quickPicksGrid.innerHTML = QUICK_CITY_PICKS.map(
    (pick, idx) => `
      <button
        type="button"
        class="quick-pick-chip"
        data-pick-idx="${idx}"
      >
        ${escapeHtml(pick.city)}
      </button>
    `,
  ).join('');

  bindAllTactileButtons(quickPicksGrid);

  quickPicksGrid.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-pick-idx]');
    if (!chip) return;
    const pick = QUICK_CITY_PICKS[Number(chip.dataset.pickIdx)];
    if (!pick) return;

    closeAllCombos(false);
    countryInput.value = pick.country;
    syncCityFieldState();
    cityInput.value = pick.city;
    cityFormError.textContent = '';
    syncQuickPickSelection(pick.country, pick.city);
  });

  syncCityFieldState();
}

// Dismiss open combobox dropdown when tapping outside inside the dialog
cityDialog.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.combo-root')) {
    closeAllCombos(false);
  }
});

cityInput.addEventListener('blur', () => {
  window.setTimeout(() => {
    if (!cityDialog.open || cityInput.disabled || cityCombo.isOpen) return;
    if (matchCatalogCountry(countryInput.value) && !cityInput.value.trim()) {
      cityFormError.textContent = 'Укажите название города.';
    }
  }, 120);
});

function openCityModal(canDismiss) {
  closeAllCombos(true);
  cityFormError.textContent = '';
  cityDialogClose.hidden = !canDismiss;
  cityDialog.setAttribute('closedby', canDismiss ? 'any' : 'none');

  if (activeCityMeta) {
    countryInput.value = activeCityMeta.country;
    syncCityFieldState();
    cityInput.value = activeCityMeta.city;
  } else {
    countryInput.value = '';
    cityInput.value = '';
    syncCityFieldState();
  }

  syncQuickPickSelection(countryInput.value, cityInput.value);
  openDialogAnimated(cityDialog, cityDialogPanel);
}

// Guard Escape key when closing an open dropdown or on first launch before a city is chosen
cityDialog.addEventListener('cancel', (e) => {
  if (countryCombo.isOpen || cityCombo.isOpen || performance.now() - lastComboEscapeAt < 100) {
    e.preventDefault();
    closeAllCombos(false);
    return;
  }
  if (!activeCityMeta) {
    e.preventDefault();
    cityFormError.textContent = 'Выберите страну и город, чтобы начать поиск заведений.';
  }
});

cityDialogClose.addEventListener('click', () => {
  if (activeCityMeta) {
    closeAllCombos(true);
    closeDialogAnimated(cityDialog, cityDialogPanel);
  }
});

cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  closeAllCombos(true);
  const matchedCountry = matchCatalogCountry(countryInput.value);
  const cityRaw = cityInput.value.trim();

  if (!matchedCountry) {
    cityFormError.textContent = 'Пожалуйста, выберите страну из списка.';
    countryInput.focus();
    return;
  }

  if (!cityRaw) {
    cityFormError.textContent = 'Пожалуйста, выберите или введите город.';
    cityInput.focus();
    return;
  }

  countryInput.value = matchedCountry.name;
  const resolvedMeta = resolveCountryAndCityMeta(matchedCountry.name, cityRaw);
  closeDialogAnimated(cityDialog, cityDialogPanel, () => {
    loadCityDeck(resolvedMeta);
  });
});

// 10. Saved & Favorites Modal + Type / Hours / Distance Filters
function getActiveSavedFiltersCount() {
  return (
    (savedTypeFilter !== 'all' ? 1 : 0) +
    (savedHoursFilter !== 'any' ? 1 : 0) +
    (savedMaxDistanceKm < MAX_DISTANCE_SLIDER_VAL ? 1 : 0)
  );
}

function syncSavedDistanceSlider() {
  const valStr = String(savedMaxDistanceKm);
  savedDistanceRange.value = valStr;
  savedDistanceRange.style.setProperty('--attr-min', savedDistanceRange.min || '0.5');
  savedDistanceRange.style.setProperty('--attr-max', savedDistanceRange.max || '15.5');
  savedDistanceRange.style.setProperty('--control-value', valStr);

  const label = formatSliderDistanceLabel(savedMaxDistanceKm);
  savedDistanceOutput.textContent = label;
  savedDistanceRange.setAttribute(
    'aria-valuetext',
    label === 'Любое' ? 'Любое расстояние' : `${label} от центра города`,
  );
}

function syncSavedFilterControls() {
  const activeCount = getActiveSavedFiltersCount();
  savedFiltersBadge.hidden = activeCount === 0;
  savedFiltersBadge.textContent = String(activeCount);
  savedFiltersReset.hidden = activeCount === 0;

  savedTypeChips.querySelectorAll('[data-saved-type]').forEach((btn) => {
    const active = btn.dataset.savedType === savedTypeFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  savedHoursChips.querySelectorAll('[data-saved-hours]').forEach((btn) => {
    const active = btn.dataset.savedHours === savedHoursFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  syncSavedDistanceSlider();
}

function resetSavedCollectionFilters() {
  savedTypeFilter = 'all';
  savedHoursFilter = 'any';
  savedMaxDistanceKm = MAX_DISTANCE_SLIDER_VAL;
  syncSavedFilterControls();
  renderSavedPlacesList();
}

async function ensureSavedPlacesHydrated() {
  if (hydrateSavedInFlight) return;
  const allSaved = storage.getSavedPlaces();
  const missing = allSaved.filter(
    (item) =>
      item.placeId &&
      !String(item.placeId).startsWith('demo_') &&
      (typeof item.distanceKm !== 'number' || !item.openingHours),
  );
  if (missing.length === 0) return;

  hydrateSavedInFlight = true;
  try {
    const hydrated = await hydrateSavedPlaces(
      missing.map((it) => ({
        placeId: it.placeId,
        city: it.city || '',
        country: it.country || '',
      })),
    );
    const updated = storage.mergeHydratedSavedPlaces(hydrated);
    if (updated && savedDialog.open) {
      renderSavedPlacesList();
    }
  } catch {
    // Non-fatal: existing saved places still render gracefully
  } finally {
    hydrateSavedInFlight = false;
  }
}

function renderSavedPlacesList() {
  const nowMs = Date.now();
  const allSaved = storage.getSavedPlaces();
  const tabMatched =
    savedFilter === 'all'
      ? allSaved
      : allSaved.filter((item) => item.status === savedFilter);

  const filtered = tabMatched.filter((item) => {
    if (savedTypeFilter !== 'all' && item.category !== savedTypeFilter) {
      return false;
    }
    if (!doesPlaceMatchHoursFilter(item, savedHoursFilter, nowMs)) {
      return false;
    }
    if (savedMaxDistanceKm < MAX_DISTANCE_SLIDER_VAL) {
      if (typeof item.distanceKm !== 'number' || item.distanceKm > savedMaxDistanceKm) {
        return false;
      }
    }
    return true;
  });

  const uniqueCities = [
    ...new Set(allSaved.map((item) => String(item.city || '').trim()).filter(Boolean)),
  ];
  const singleCitySuffix = uniqueCities.length === 1 ? ` · ${uniqueCities[0]}` : '';
  const showCityOnCard = uniqueCities.length > 1;

  const activeCount = getActiveSavedFiltersCount();
  if (allSaved.length === 0) {
    savedDialogSubtitle.textContent = 'Места со свайпом вправо и вверх';
  } else if (activeCount > 0 || savedFilter !== 'all') {
    savedDialogSubtitle.textContent = `Показано ${filtered.length} из ${allSaved.length} мест${singleCitySuffix}`;
  } else {
    savedDialogSubtitle.textContent = `Сохранено мест: ${allSaved.length}${singleCitySuffix}`;
  }

  if (tabMatched.length === 0) {
    savedListEl.innerHTML = `
      <div class="saved-empty">
        <span>
          ${
            savedFilter === 'favorite'
              ? 'Свайпайте карточки вверх, чтобы добавлять лучшие места в Избранное.'
              : savedFilter === 'interested'
                ? 'Свайпайте карточки вправо («Хочу»), чтобы сохранять места для будущего визита.'
                : 'Свайпайте карточки вправо («Хочу») или вверх («Избранное»), и они появятся здесь с быстрым переходом на карту.'
          }
        </span>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    savedListEl.innerHTML = `
      <div class="saved-empty">
        <span>По выбранным фильтрам заведений не найдено.</span>
        <button type="button" class="saved-empty-reset-btn" data-reset-saved-filters="1">
          Сбросить фильтры
        </button>
      </div>
    `;
    bindAllTactileButtons(savedListEl);
    return;
  }

  const categoryShortMap = {
    restaurant: 'Ресторан',
    bar: 'Бар',
    cafe: 'Кафе',
  };

  const itemsHtml = filtered
    .map((item) => {
      const distShort = formatCompactDistanceKm(item.distanceKm);
      const hoursSummary = formatTodayHoursSummary(item, nowMs);
      const catText = categoryShortMap[item.category] || item.categoryLabel || 'Место';

      const geoMeta =
        item.country || item.city
          ? resolveCountryAndCityMeta(item.country || '', item.city || '')
          : null;
      const cleanAddr = formatCompactStreetAddress(item.address, [
        item.city,
        item.country,
        geoMeta?.queryCity,
        geoMeta?.queryCountry,
      ]);

      const hasRating = typeof item.rating === 'number' && Number.isFinite(item.rating) && item.rating > 0;
      const priceText = String(item.priceSymbol || '').trim();

      const primaryParts = [];
      if (hasRating) {
        primaryParts.push(
          `<span class="saved-rating">${ICONS.starFilled}<span>${Number(item.rating).toFixed(
            1,
          )}</span></span>`,
        );
      }
      primaryParts.push(`<span class="saved-cat">${escapeHtml(catText)}</span>`);
      if (priceText) {
        primaryParts.push(`<span class="saved-price">${escapeHtml(priceText)}</span>`);
      }
      if (showCityOnCard && item.city) {
        primaryParts.push(`<span class="saved-city-name">${escapeHtml(item.city)}</span>`);
      }

      const hoursRowHtml = hoursSummary
        ? `<p class="saved-hours-row">
            <span class="saved-status-dot${hoursSummary.isOpen ? ' is-open' : ''}" aria-hidden="true"></span>
            <span class="saved-hours-state${hoursSummary.isOpen ? ' is-open' : ''}">${escapeHtml(
              hoursSummary.stateText,
            )}</span>
            ${
              hoursSummary.rangeText
                ? `<span class="saved-hours-time">· ${escapeHtml(hoursSummary.rangeText)}</span>`
                : ''
            }
          </p>`
        : '';

      const locationRowHtml =
        distShort || cleanAddr
          ? `<p class="saved-location-row">
              ${distShort ? `<span class="saved-dist">${escapeHtml(distShort)}</span>` : ''}
              ${
                distShort && cleanAddr
                  ? '<span class="saved-sep" aria-hidden="true">·</span>'
                  : ''
              }
              ${cleanAddr ? `<span class="saved-addr">${escapeHtml(cleanAddr)}</span>` : ''}
            </p>`
          : '';

      return `
      <li class="saved-card-slot">
        <article class="saved-item" data-saved-id="${escapeHtml(item.placeId)}">
          ${
            item.photoUrl
              ? `<img class="saved-thumb" data-saved-cat="${escapeHtml(
                  item.category || 'restaurant',
                )}" data-photo-src="${escapeHtml(item.photoUrl)}" alt="" decoding="async" width="76" height="76" />`
              : `<div class="saved-thumb saved-thumb--fallback" aria-hidden="true">${getCategoryIcon(
                  item.category,
                )}</div>`
          }
          <header class="saved-header">
            <h3 class="saved-name">${escapeHtml(item.name)}</h3>
            ${
              item.status === 'favorite'
                ? `<span class="saved-badge-fav" role="img" aria-label="В избранном">${ICONS.starFilled}</span>`
                : ''
            }
          </header>
          <div class="saved-details">
            <p class="saved-primary-meta">${primaryParts.join(
              '<span class="saved-sep" aria-hidden="true">·</span>',
            )}</p>
            ${hoursRowHtml}
            ${locationRowHtml}
          </div>
          <footer class="saved-actions">
            <a
              class="saved-icon-btn saved-maps-btn tactile-link"
              href="${escapeHtml(item.mapsUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Открыть ${escapeHtml(item.name)} на карте"
            >
              ${ICONS.externalMaps}
            </a>
            <button
              type="button"
              class="saved-icon-btn saved-remove-btn"
              data-remove-saved="${escapeHtml(item.placeId)}"
              aria-label="Удалить ${escapeHtml(item.name)} из подборки"
            >
              ${ICONS.trash}
            </button>
          </footer>
        </article>
      </li>
    `;
    })
    .join('');

  savedListEl.innerHTML = `<ul class="saved-cards" role="list">${itemsHtml}</ul>`;

  if (savedThumbObserver) {
    savedThumbObserver.disconnect();
  }
  if ('IntersectionObserver' in window) {
    savedThumbObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const imgEl = entry.target;
          observer.unobserve(imgEl);
          hydrateLazyPhoto(imgEl, { fadeIn: true, maxWidthPx: 200, maxHeightPx: 200 });
        }
      },
      { root: savedListEl, rootMargin: '80px 0px' },
    );
  }

  savedListEl.querySelectorAll('img.saved-thumb').forEach((imgEl) => {
    imgEl.addEventListener(
      'error',
      () => {
        const fallback = document.createElement('div');
        fallback.className = 'saved-thumb saved-thumb--fallback';
        fallback.setAttribute('aria-hidden', 'true');
        fallback.innerHTML = getCategoryIcon(imgEl.dataset.savedCat);
        imgEl.replaceWith(fallback);
      },
      { once: true },
    );
    if (savedThumbObserver) {
      savedThumbObserver.observe(imgEl);
    } else {
      hydrateLazyPhoto(imgEl, { fadeIn: true, maxWidthPx: 200, maxHeightPx: 200 });
    }
  });

  bindAllTactileButtons(savedListEl);
}

syncSavedFilterControls();

savedTriggerBtn.addEventListener('click', () => {
  syncSavedFilterControls();
  renderSavedPlacesList();
  openDialogAnimated(savedDialog, savedDialogPanel);
  ensureSavedPlacesHydrated();
});

savedDialogClose.addEventListener('click', () => {
  closeDialogAnimated(savedDialog, savedDialogPanel);
});

savedTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-saved-filter]');
  if (!tab) return;
  savedFilter = tab.dataset.savedFilter || 'all';
  savedTabs.querySelectorAll('.saved-tab').forEach((btn) => {
    const active = btn === tab;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  renderSavedPlacesList();
});

savedFiltersToggle.addEventListener('click', () => {
  savedFiltersExpanded = !savedFiltersExpanded;
  savedFiltersToggle.setAttribute('aria-expanded', savedFiltersExpanded ? 'true' : 'false');
  animateFilterPanelState(
    savedFiltersPanel,
    savedChevronSvg,
    savedFiltersExpanded,
    () => !savedFiltersExpanded,
  );
});

savedFiltersReset.addEventListener('click', () => {
  resetSavedCollectionFilters();
});

savedTypeChips.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-saved-type]');
  if (!chip) return;
  const nextType = chip.dataset.savedType || 'all';
  if (nextType === savedTypeFilter) return;
  savedTypeFilter = nextType;
  syncSavedFilterControls();
  renderSavedPlacesList();
});

savedHoursChips.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-saved-hours]');
  if (!chip) return;
  chip.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const nextHours = chip.dataset.savedHours || 'any';
  if (nextHours === savedHoursFilter) return;
  savedHoursFilter = nextHours;
  syncSavedFilterControls();
  renderSavedPlacesList();
});

savedDistanceRange.addEventListener('input', () => {
  savedMaxDistanceKm = Number(savedDistanceRange.value);
  syncSavedFilterControls();
  renderSavedPlacesList();
});

savedListEl.addEventListener('click', (e) => {
  const resetBtn = e.target.closest('[data-reset-saved-filters]');
  if (resetBtn) {
    resetSavedCollectionFilters();
    return;
  }

  const removeBtn = e.target.closest('[data-remove-saved]');
  if (!removeBtn) return;
  const id = removeBtn.dataset.removeSaved;
  if (!id) return;
  storage.removeSavedPlace(id);
  updateSavedCounter(false);
  renderSavedPlacesList();
});

// Light-dismiss fallback for browsers without native <dialog closedby="any"> (e.g. Safari)
if (!('closedBy' in HTMLDialogElement.prototype)) {
  const isOutsidePanel = (e, panel) => {
    const r = panel.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  const attachLightDismissFallback = (dialogEl, panelEl, canCloseFn) => {
    let pressedOutside = false;
    dialogEl.addEventListener('pointerdown', (e) => {
      pressedOutside = canCloseFn() && isOutsidePanel(e, panelEl);
    });
    dialogEl.addEventListener('pointerup', (e) => {
      if (pressedOutside && canCloseFn() && isOutsidePanel(e, panelEl)) {
        closeDialogAnimated(dialogEl, panelEl);
      }
      pressedOutside = false;
    });
  };

  attachLightDismissFallback(
    cityDialog,
    cityDialogPanel,
    () => cityDialog.getAttribute('closedby') === 'any',
  );
  attachLightDismissFallback(savedDialog, savedDialogPanel, () => true);
}

// 11. Category Filter & Action Dock Listeners
cityTriggerBtn.addEventListener('click', () => openCityModal(Boolean(activeCityMeta)));

categoryBar.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-category]');
  if (!chip) return;
  const nextCat = chip.dataset.category || 'all';
  if (nextCat === activeCategory) return;

  activeCategory = nextCat;
  categoryBar.querySelectorAll('.category-chip').forEach((c) => {
    c.classList.toggle('is-active', c === chip);
  });

  if (activeCityMeta) {
    loadCityDeck(activeCityMeta);
  }
});

for (const [dir, btn] of Object.entries(actionButtons)) {
  btn?.addEventListener('click', () => {
    physics.triggerSwipe(dir);
  });
}

// Optional desktop keyboard arrows when no modal/input is open
window.addEventListener('keydown', (e) => {
  if (cityDialog.open || savedDialog.open) return;
  if (e.target.closest('input, textarea, select')) return;

  const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  };
  const dir = keyMap[e.key];
  if (dir && mountedCards.length > 0) {
    e.preventDefault();
    physics.triggerSwipe(dir);
  }
});

// 12. Main Simulation Loop (Planck.js + regl WebGL Noise synced to real clamped dt)
let lastTimestamp = performance.now();
function tick(now) {
  const rawDt = (now - lastTimestamp) / 1000;
  lastTimestamp = now;
  const dt = Math.min(Math.max(rawDt, 0.001), 0.033);

  if (!document.hidden) {
    physics.step(dt);
    bg.step(dt);
  }
  window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);

// 13. Boot App
populateCountriesCatalog();
updateSavedCounter(false);

if (activeCityMeta) {
  currentCityLabel.textContent = `${activeCityMeta.city}, ${activeCityMeta.country}`;
  loadCityDeck(activeCityMeta);
} else {
  setActionDockEnabled(false);
  openCityModal(false);
}
