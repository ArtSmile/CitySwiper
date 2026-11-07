import { animate, cubicBezier, stagger, utils } from 'animejs';
import { resolvePhotoUrl } from '../services/placesApi.js';

export const EASE_UI_OUT = cubicBezier(0.23, 1, 0.32, 1);
export const EASE_SHEET = cubicBezier(0.32, 0.72, 0, 1);

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

export function onReducedMotionChange(cb) {
  reducedMotionQuery.addEventListener('change', (e) => cb(e.matches));
}

/**
 * Interruptibly animates press feedback (pointerdown -> scale 0.96, release -> 1)
 * Strictly driven by Anime.js per AGENTS.md Rule 1.
 */
export function bindTactileButton(el, pressedScale = 0.96) {
  if (!el || el.dataset.tactileBound === '1') return;
  el.dataset.tactileBound = '1';

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (el.disabled) return;
    utils.remove(el);
    animate(el, {
      scale: prefersReducedMotion() ? 0.99 : pressedScale,
      duration: 115,
      ease: EASE_UI_OUT,
    });
  };

  const onRelease = () => {
    utils.remove(el);
    animate(el, {
      scale: 1,
      duration: 155,
      ease: EASE_UI_OUT,
    });
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onRelease);
  el.addEventListener('pointercancel', onRelease);
  el.addEventListener('pointerleave', onRelease);
}

export function bindAllTactileButtons(root = document) {
  const buttons = root.querySelectorAll('button, .tactile-link');
  for (const btn of buttons) {
    bindTactileButton(btn);
  }
}

/**
 * Stack depth layout targets for cards underneath the active card:
 * index 0 -> active card (scale 1, y 0, opacity 1)
 * index 1 -> second card (scale 0.955, y 14, opacity 0.9)
 * index 2 -> third card (scale 0.91, y 27, opacity 0.62)
 */
export function getStackTargetForDepth(depthIndex) {
  if (depthIndex <= 0) {
    return { scale: 1, y: 0, opacity: 1 };
  }
  if (depthIndex === 1) {
    return { scale: 0.956, y: 12, opacity: 0.95 };
  }
  return { scale: 0.912, y: 23, opacity: 0.78 };
}

/**
 * Continuously interpolates background stack cards in direct response to active card drag progress [0..1]
 */
export function scrubBackgroundCards(cardEls, progress) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  if (prefersReducedMotion()) return;

  for (let i = 1; i < cardEls.length; i += 1) {
    const surface = cardEls[i]?.querySelector('.venue-card-surface') || cardEls[i];
    if (!surface) continue;
    utils.remove(surface);
    const from = getStackTargetForDepth(i);
    const to = getStackTargetForDepth(i - 1);
    const scale = from.scale + (to.scale - from.scale) * clamped;
    const y = from.y + (to.y - from.y) * clamped;
    const opacity = from.opacity + (to.opacity - from.opacity) * clamped;
    surface.style.transform = `translate3d(0px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    surface.style.opacity = opacity.toFixed(3);
  }
}

/**
 * Promotes or settles cards in the deck stack via Anime.js
 * Targets .venue-card-surface so outer .venue-card remains exclusively owned by Planck.js physics
 */
export function settleStackCards(cardEls, isInitialEntrance = false) {
  const reduce = prefersReducedMotion();
  cardEls.forEach((cardEl, idx) => {
    const surface = cardEl?.querySelector('.venue-card-surface') || cardEl;
    if (!surface) return;
    utils.remove(surface);
    const target = getStackTargetForDepth(idx);

    if (isInitialEntrance) {
      surface.style.opacity = '0';
      surface.style.transform = `translate3d(0px, ${reduce ? target.y : target.y + 18}px, 0) scale(${
        reduce ? target.scale : Math.max(0.92, target.scale - 0.035)
      })`;
    }

    animate(surface, {
      translateX: 0,
      translateY: target.y,
      scale: target.scale,
      opacity: target.opacity,
      duration: reduce ? 160 : isInitialEntrance ? 250 : 225,
      delay: isInitialEntrance && !reduce ? idx * 45 : 0,
      ease: EASE_UI_OUT,
    });
  });
}

/**
 * Animates directional action buttons hinting at current drag direction
 */
export function highlightActionButtons(buttonMap, activeDirection, intensity) {
  const reduce = prefersReducedMotion();
  for (const [dir, btn] of Object.entries(buttonMap)) {
    if (!btn) continue;
    const isMatch = dir === activeDirection && intensity > 0.08;
    const scale = isMatch && !reduce ? 1 + Math.min(intensity, 1) * 0.13 : 1;
    btn.dataset.highlighted = isMatch ? 'true' : 'false';
    if (!btn.matches(':active')) {
      btn.style.transform = `scale(${scale.toFixed(3)})`;
    }
  }
}

export function resetActionButtons(buttonMap) {
  for (const btn of Object.values(buttonMap)) {
    if (!btn) continue;
    btn.dataset.highlighted = 'false';
    utils.remove(btn);
    animate(btn, {
      scale: 1,
      duration: 180,
      ease: EASE_UI_OUT,
    });
  }
}

/**
 * Opens a native <dialog> with an interruptible Anime.js sheet/modal entrance (never scale(0))
 */
export function openDialogAnimated(dialogEl, panelEl) {
  if (!dialogEl) return;
  if (!dialogEl.open) {
    dialogEl.showModal();
  }
  if (!panelEl) return;

  const reduce = prefersReducedMotion();
  utils.remove(panelEl);
  panelEl.style.opacity = '0';
  panelEl.style.transform = reduce
    ? 'translate3d(0, 0, 0) scale(1)'
    : 'translate3d(0, 18px, 0) scale(0.95)';

  animate(panelEl, {
    translateY: 0,
    scale: 1,
    opacity: 1,
    duration: reduce ? 150 : 240,
    ease: EASE_SHEET,
  });
}

/**
 * Closes a native <dialog> after a snappy Anime.js exit
 */
export function closeDialogAnimated(dialogEl, panelEl, onDone) {
  if (!dialogEl || !dialogEl.open) {
    onDone?.();
    return;
  }
  if (!panelEl) {
    dialogEl.close();
    dialogEl.returnValue = '';
    onDone?.();
    return;
  }

  const reduce = prefersReducedMotion();
  utils.remove(panelEl);
  animate(panelEl, {
    translateY: reduce ? 0 : 12,
    scale: reduce ? 1 : 0.96,
    opacity: 0,
    duration: reduce ? 120 : 175,
    ease: EASE_UI_OUT,
    onComplete: () => {
      if (dialogEl.open) {
        dialogEl.close();
      }
      dialogEl.returnValue = '';
      panelEl.style.transform = '';
      panelEl.style.opacity = '';
      onDone?.();
    },
  });
}

export function bumpSavedCounter(badgeEl) {
  if (!badgeEl) return;
  utils.remove(badgeEl);
  if (prefersReducedMotion()) return;
  animate(badgeEl, {
    scale: [1, 1.18, 1],
    duration: 220,
    ease: EASE_UI_OUT,
  });
}

export function startLoadingPulse(containerEl) {
  if (!containerEl) return null;
  const blocks = containerEl.querySelectorAll('[data-pulse]');
  if (!blocks.length) return null;
  utils.remove(blocks);
  return animate(blocks, {
    opacity: [0.46, 0.9],
    duration: 850,
    delay: stagger(65),
    alternate: true,
    loop: true,
    ease: 'inOutSine',
  });
}

/**
 * Animates a combobox dropdown list open and rotates its chevron via Anime.js (AGENTS.md Rule 1).
 * Never starts from scale(0); anchors transform-origin to the trigger edge.
 */
export function animateDropdownOpen(dropdownEl, chevronEl, openUp = false) {
  if (!dropdownEl) return;
  const reduce = prefersReducedMotion();
  utils.remove(dropdownEl);
  dropdownEl.hidden = false;
  dropdownEl.style.transformOrigin = openUp ? '50% 100%' : '50% 0%';
  dropdownEl.style.opacity = '0';
  dropdownEl.style.transform = reduce
    ? 'translate3d(0px, 0px, 0px) scale(1)'
    : `translate3d(0px, ${openUp ? 6 : -6}px, 0px) scale(0.96)`;

  animate(dropdownEl, {
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: reduce ? 110 : 155,
    ease: EASE_UI_OUT,
  });

  if (chevronEl) {
    utils.remove(chevronEl);
    animate(chevronEl, {
      rotate: 180,
      duration: reduce ? 110 : 155,
      ease: EASE_UI_OUT,
    });
  }
}

/**
 * Animates a combobox dropdown list closed and resets its chevron via Anime.js.
 */
export function animateDropdownClose(dropdownEl, chevronEl, openUp = false, shouldStayHidden = () => true) {
  if (!dropdownEl || dropdownEl.hidden) return;
  const reduce = prefersReducedMotion();
  utils.remove(dropdownEl);

  animate(dropdownEl, {
    opacity: 0,
    translateY: reduce ? 0 : openUp ? 5 : -5,
    scale: reduce ? 1 : 0.97,
    duration: reduce ? 95 : 120,
    ease: EASE_UI_OUT,
    onComplete: () => {
      if (shouldStayHidden()) {
        dropdownEl.hidden = true;
        dropdownEl.style.transform = '';
        dropdownEl.style.opacity = '';
      }
    },
  });

  if (chevronEl) {
    utils.remove(chevronEl);
    animate(chevronEl, {
      rotate: 0,
      duration: reduce ? 95 : 135,
      ease: EASE_UI_OUT,
    });
  }
}

/**
 * Animates the Saved Filters panel open/closed via GPU-only transform & opacity (AGENTS.md Rule 1).
 */
export function animateFilterPanelState(panelEl, chevronEl, expand, shouldStayClosed = () => false) {
  if (!panelEl) return;
  const reduce = prefersReducedMotion();
  utils.remove(panelEl);

  if (expand) {
    panelEl.hidden = false;
    panelEl.style.transformOrigin = '50% 0%';
    panelEl.style.opacity = '0';
    panelEl.style.transform = reduce
      ? 'translate3d(0px, 0px, 0px) scale(1)'
      : 'translate3d(0px, -6px, 0px) scale(0.98)';

    animate(panelEl, {
      opacity: 1,
      translateY: 0,
      scale: 1,
      duration: reduce ? 110 : 170,
      ease: EASE_UI_OUT,
    });
  } else {
    animate(panelEl, {
      opacity: 0,
      translateY: reduce ? 0 : -5,
      scale: reduce ? 1 : 0.98,
      duration: reduce ? 95 : 130,
      ease: EASE_UI_OUT,
      onComplete: () => {
        if (shouldStayClosed()) {
          panelEl.hidden = true;
          panelEl.style.transform = '';
          panelEl.style.opacity = '';
        }
      },
    });
  }

  if (chevronEl) {
    utils.remove(chevronEl);
    animate(chevronEl, {
      rotate: expand ? 180 : 0,
      duration: reduce ? 105 : 155,
      ease: EASE_UI_OUT,
    });
  }
}

/**
 * Hydrates a deferred Google Places photo (data-photo-src -> src) strictly on demand,
 * using Anime.js opacity reveal when requested.
 */
export async function hydrateLazyPhoto(
  imgEl,
  { priority = null, fadeIn = false, maxWidthPx = 720, maxHeightPx = 900 } = {},
) {
  if (!imgEl) return false;
  const rawSrc = imgEl.dataset.photoSrc;
  if (!rawSrc) {
    if (priority === 'high') {
      imgEl.setAttribute('fetchpriority', 'high');
    }
    return false;
  }

  delete imgEl.dataset.photoSrc;

  if (priority === 'high' || priority === 'low') {
    imgEl.setAttribute('fetchpriority', priority);
  } else {
    imgEl.removeAttribute('fetchpriority');
  }

  if (fadeIn) {
    imgEl.style.opacity = '0';
    imgEl.addEventListener(
      'load',
      () => {
        utils.remove(imgEl);
        animate(imgEl, {
          opacity: [0, 1],
          duration: prefersReducedMotion() ? 90 : 155,
          ease: EASE_UI_OUT,
        });
      },
      { once: true },
    );
  }

  try {
    const finalUrl = await resolvePhotoUrl(rawSrc, { maxWidthPx, maxHeightPx, priority });
    if (!imgEl.isConnected && !imgEl.parentElement) {
      return false;
    }
    if (finalUrl) {
      imgEl.src = finalUrl;
      return true;
    }
    imgEl.dispatchEvent(new Event('error'));
    return false;
  } catch {
    imgEl.dispatchEvent(new Event('error'));
    return false;
  }
}

/**
 * Steps the looped venue photo carousel forward ('next') or backward ('prev')
 * wrapping cyclically across all slides via interruptible Anime.js GPU transforms & opacity.
 */
export function stepCardPhotoCarousel(cardEl, direction) {
  if (!cardEl) return false;
  const carousel = cardEl.querySelector('.venue-carousel');
  if (!carousel) return false;

  const slides = Array.from(carousel.querySelectorAll('.venue-slide'));
  const count = slides.length;
  if (count <= 1) return false;

  const fills = Array.from(cardEl.querySelectorAll('.venue-story-fill'));
  const currentIdx = ((Number(carousel.dataset.activeSlide || 0) % count) + count) % count;
  const delta = direction === 'next' ? 1 : -1;
  const targetIdx = (currentIdx + delta + count) % count;
  const reduce = prefersReducedMotion();

  carousel.dataset.activeSlide = String(targetIdx);

  // Lazy-load strictly the target slide from Google Photos API only when requested by the user
  const targetImg = slides[targetIdx]?.querySelector('.venue-photo');
  if (targetImg) {
    hydrateLazyPhoto(targetImg, { fadeIn: true });
  }

  slides.forEach((slide, idx) => {
    utils.remove(slide);
    if (idx !== currentIdx && idx !== targetIdx) {
      slide.classList.remove('is-active');
      slide.style.opacity = '0';
      slide.style.zIndex = '0';
      slide.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
    }
  });

  const prevSlide = slides[currentIdx];
  const nextSlide = slides[targetIdx];

  if (prevSlide) {
    prevSlide.classList.remove('is-active');
    prevSlide.style.zIndex = '1';
    animate(prevSlide, {
      opacity: 0,
      translateX: reduce ? 0 : delta * -14,
      scale: 1,
      duration: reduce ? 130 : 165,
      ease: EASE_UI_OUT,
    });
  }

  if (nextSlide) {
    nextSlide.classList.add('is-active');
    nextSlide.style.zIndex = '2';
    nextSlide.style.opacity = '0';
    nextSlide.style.transform = reduce
      ? 'translate3d(0px, 0px, 0px) scale(1)'
      : `translate3d(${delta * 14}px, 0px, 0px) scale(1.015)`;

    animate(nextSlide, {
      opacity: 1,
      translateX: 0,
      scale: 1,
      duration: reduce ? 135 : 185,
      ease: EASE_UI_OUT,
    });
  }

  fills.forEach((fill, idx) => {
    utils.remove(fill);
    if (idx === targetIdx) {
      fill.classList.add('is-active');
      fill.style.transformOrigin = delta > 0 ? '0% 50%' : '100% 50%';
      fill.style.opacity = '0.55';
      fill.style.transform = reduce ? 'scaleX(1)' : 'scaleX(0.28)';
      animate(fill, {
        scaleX: 1,
        opacity: 1,
        duration: reduce ? 130 : 180,
        ease: EASE_UI_OUT,
      });
    } else {
      fill.classList.remove('is-active');
      fill.style.opacity = '0';
      fill.style.transform = 'scaleX(0)';
    }
  });

  return true;
}
