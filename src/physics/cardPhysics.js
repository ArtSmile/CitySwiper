import { animate, utils } from 'animejs';
import { Box, MouseJoint, Vec2, World } from 'planck';
import { EASE_UI_OUT, prefersReducedMotion } from '../ui/animations.js';

const PPM = 100; // 100 CSS pixels = 1 meter in Planck.js

/**
 * Planck.js 2D rigid-body physics controller for Tinder-style 4-way card swiping (AGENTS.md Rule 2).
 *
 * - Active card is a dynamic Body with Box fixture, real mass, moment of inertia, linear & angular damping.
 * - Grabbing top vs bottom edge via MouseJoint produces authentic physical torque difference.
 * - Multi-touch protected + setPointerCapture.
 * - Momentum projection (position + velocity) decides 4-way commit on release (left, right, up, down).
 * - Return-to-center stays in Planck.js via critically damped spring force so mid-flight re-grabs
 *   carry live velocity seamlessly with zero seam.
 */
export class CardPhysicsController {
  constructor({ onDragProgress, onSwipeCommit, onCardTap, onCardGrab }) {
    this.onDragProgress = onDragProgress;
    this.onSwipeCommit = onSwipeCommit;
    this.onCardTap = onCardTap;
    this.onCardGrab = onCardGrab;

    this.world = new World(new Vec2(0, 0));
    this.groundBody = this.world.createBody();

    this.activeCard = null;
    this.exitingCards = [];
  }

  attachCard(cardEl) {
    this.detachActiveCard(true);
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const widthM = Math.max(1.8, (rect.width || 340) / PPM);
    const heightM = Math.max(2.4, (rect.height || 460) / PPM);

    const body = this.world.createDynamicBody({
      position: new Vec2(0, 0),
      linearDamping: 4.2,
      angularDamping: 6.8,
      bullet: false,
    });

    body.createFixture(new Box(widthM * 0.5, heightM * 0.5), {
      density: 0.68,
      friction: 0.25,
      restitution: 0.05,
      filterGroupIndex: -1,
      filterMaskBits: 0,
    });

    const stamps = {
      left: cardEl.querySelector('[data-stamp="left"]'),
      right: cardEl.querySelector('[data-stamp="right"]'),
      up: cardEl.querySelector('[data-stamp="up"]'),
      down: cardEl.querySelector('[data-stamp="down"]'),
    };

    const state = {
      el: cardEl,
      body,
      mouseJoint: null,
      pointerId: null,
      downX: 0,
      downY: 0,
      downTime: 0,
      maxTravel: 0,
      mode: 'idle', // 'idle' | 'dragging' | 'returning'
      stamps,
      stageCenterX: rect.left + rect.width * 0.5,
      stageCenterY: rect.top + rect.height * 0.5,
      threshX: Math.min(Math.max(rect.width * 0.28, 84), 118),
      threshY: Math.min(Math.max(rect.height * 0.22, 86), 122),
      cleanupListeners: null,
    };

    const updateStageMetrics = () => {
      const parent = cardEl.parentElement;
      if (!parent) return;
      const pRect = parent.getBoundingClientRect();
      state.stageCenterX = pRect.left + pRect.width * 0.5;
      state.stageCenterY = pRect.top + pRect.height * 0.5;
      state.threshX = Math.min(Math.max(pRect.width * 0.28, 84), 118);
      state.threshY = Math.min(Math.max(pRect.height * 0.22, 86), 122);
    };

    const pointerToWorld = (clientX, clientY) =>
      new Vec2(
        (clientX - state.stageCenterX) / PPM,
        (clientY - state.stageCenterY) / PPM,
      );

    const onPointerDown = (e) => {
      // Primary button only & ignore interactive controls inside the card (e.g. "Open in Maps")
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('a, button, [data-no-drag]')) return;
      // Multi-touch protection: ignore extra fingers while dragging
      if (state.pointerId !== null) return;

      updateStageMetrics();
      state.pointerId = e.pointerId;
      state.downX = e.clientX;
      state.downY = e.clientY;
      state.downTime = performance.now();
      state.maxTravel = 0;
      state.mode = 'dragging';
      cardEl.classList.add('is-dragging');
      this.onCardGrab?.();

      try {
        cardEl.setPointerCapture(e.pointerId);
      } catch {
        // Ignore synthetic events without active pointer
      }

      if (state.mouseJoint) {
        this.world.destroyJoint(state.mouseJoint);
        state.mouseJoint = null;
      }

      const grabWorld = pointerToWorld(e.clientX, e.clientY);
      state.mouseJoint = this.world.createJoint(
        new MouseJoint(
          {
            maxForce: 1650 * body.getMass(),
            frequencyHz: 15.8,
            dampingRatio: 0.94,
          },
          this.groundBody,
          body,
          grabWorld,
        ),
      );
      body.setAwake(true);
    };

    const onPointerMove = (e) => {
      if (e.pointerId !== state.pointerId || !state.mouseJoint) return;
      const dist = Math.hypot(e.clientX - state.downX, e.clientY - state.downY);
      if (dist > state.maxTravel) {
        state.maxTravel = dist;
      }
      const targetWorld = pointerToWorld(e.clientX, e.clientY);
      state.mouseJoint.setTarget(targetWorld);
    };

    const endGesture = (e, isCancelled = false) => {
      if (e.pointerId !== state.pointerId) return;

      try {
        if (cardEl.hasPointerCapture(e.pointerId)) {
          cardEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe ignore
      }

      const finalDist = Math.hypot(e.clientX - state.downX, e.clientY - state.downY);
      const maxTravel = Math.max(state.maxTravel, finalDist);
      const tapElapsed = performance.now() - state.downTime;

      state.pointerId = null;
      cardEl.classList.remove('is-dragging');

      if (state.mouseJoint) {
        this.world.destroyJoint(state.mouseJoint);
        state.mouseJoint = null;
      }

      if (isCancelled) {
        state.mode = 'returning';
        return;
      }

      // Disambiguate intentional tap (<= 9px travel, < 420ms) from physical card drag:
      // Right side of card -> next photo; Left side of card -> previous photo
      if (maxTravel <= 9 && tapElapsed < 420) {
        state.mode = 'returning';
        const cRect = cardEl.getBoundingClientRect();
        const side = e.clientX < cRect.left + cRect.width * 0.5 ? 'prev' : 'next';
        this.onCardTap?.({
          cardEl,
          side,
          clientX: e.clientX,
          clientY: e.clientY,
        });
        return;
      }

      const pos = body.getPosition();
      const vel = body.getLinearVelocity();
      const dx = pos.x * PPM;
      const dy = pos.y * PPM;
      const vx = vel.x * PPM;
      const vy = vel.y * PPM;

      // Momentum projection (Apple fluid interfaces velocity handoff)
      const projX = dx + vx * 0.19;
      const projY = dy + vy * 0.19;

      const normX = Math.abs(projX) / state.threshX;
      const normY = Math.abs(projY) / state.threshY;

      let chosenDir = null;
      if (normX >= normY) {
        const fastFlickX = Math.abs(vx) > 470 && Math.abs(dx) > 22 && Math.sign(vx) === Math.sign(dx);
        if (normX >= 1.0 || fastFlickX) {
          chosenDir = projX >= 0 ? 'right' : 'left';
        }
      } else {
        const fastFlickY = Math.abs(vy) > 470 && Math.abs(dy) > 22 && Math.sign(vy) === Math.sign(dy);
        if (normY >= 1.0 || fastFlickY) {
          chosenDir = projY < 0 ? 'up' : 'down';
        }
      }

      if (chosenDir) {
        this._commitCardExit(state, chosenDir, false);
      } else {
        state.mode = 'returning';
      }
    };

    const onPointerUp = (e) => endGesture(e, false);
    const onPointerCancel = (e) => endGesture(e, true);
    const onLostCapture = (e) => {
      if (state.pointerId !== null && e.pointerId === state.pointerId) {
        endGesture(e, false);
      }
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
    cardEl.addEventListener('pointermove', onPointerMove);
    cardEl.addEventListener('pointerup', onPointerUp);
    cardEl.addEventListener('pointercancel', onPointerCancel);
    cardEl.addEventListener('lostpointercapture', onLostCapture);

    state.cleanupListeners = () => {
      cardEl.removeEventListener('pointerdown', onPointerDown);
      cardEl.removeEventListener('pointermove', onPointerMove);
      cardEl.removeEventListener('pointerup', onPointerUp);
      cardEl.removeEventListener('pointercancel', onPointerCancel);
      cardEl.removeEventListener('lostpointercapture', onLostCapture);
    };

    this.activeCard = state;
  }

  /**
   * Programmatic swipe triggered by one of the 4 action buttons or keyboard arrows
   */
  triggerSwipe(direction) {
    if (!this.activeCard) return false;
    const state = this.activeCard;

    if (state.mouseJoint) {
      this.world.destroyJoint(state.mouseJoint);
      state.mouseJoint = null;
    }
    state.pointerId = null;
    state.el.classList.remove('is-dragging');

    // Show directional stamp prominently via Anime.js as card launches
    const stamp = state.stamps[direction];
    if (stamp) {
      utils.remove(stamp);
      stamp.style.opacity = '0';
      stamp.style.transform = 'scale(0.92)';
      animate(stamp, {
        opacity: 1,
        scale: 1,
        duration: 130,
        ease: EASE_UI_OUT,
      });
    }

    this._commitCardExit(state, direction, true);
    return true;
  }

  _commitCardExit(state, direction, fromButton) {
    if (this.activeCard === state) {
      this.activeCard = null;
    }
    state.cleanupListeners?.();
    state.el.style.pointerEvents = 'none';

    const reduce = prefersReducedMotion();
    const { body, el } = state;
    const mass = body.getMass();

    if (!reduce) {
      const vel = body.getLinearVelocity();
      const boostVectors = {
        left: new Vec2(-13.5, vel.y * 0.25 - 0.5),
        right: new Vec2(13.5, vel.y * 0.25 - 0.5),
        up: new Vec2(vel.x * 0.25, -15.0),
        down: new Vec2(vel.x * 0.25, 14.0),
      };
      const targetVel = boostVectors[direction] || new Vec2(12, 0);

      // Preserve flick momentum if user threw faster than baseline boost
      const finalVx =
        direction === 'left'
          ? Math.min(vel.x * 1.12, targetVel.x)
          : direction === 'right'
            ? Math.max(vel.x * 1.12, targetVel.x)
            : targetVel.x;
      const finalVy =
        direction === 'up'
          ? Math.min(vel.y * 1.12, targetVel.y)
          : direction === 'down'
            ? Math.max(vel.y * 1.12, targetVel.y)
            : targetVel.y;

      body.setLinearDamping(0.4);
      body.setAngularDamping(1.2);
      body.applyLinearImpulse(
        new Vec2((finalVx - vel.x) * mass, (finalVy - vel.y) * mass),
        body.getWorldCenter(),
        true,
      );

      if (fromButton) {
        const spinSign = direction === 'left' ? -1 : direction === 'right' ? 1 : 0.25;
        body.applyAngularImpulse(spinSign * mass * 0.9, true);
      }

      this.exitingCards.push({
        el,
        body,
        elapsed: 0,
        maxDuration: 0.28,
      });
    } else {
      // Gentle non-vestibular fade under prefers-reduced-motion: reduce
      this.world.destroyBody(body);
    }

    utils.remove(el);
    animate(el, {
      opacity: 0,
      duration: reduce ? 160 : 245,
      ease: EASE_UI_OUT,
      onComplete: () => {
        el.remove();
      },
    });

    this.onDragProgress?.({
      nx: 0,
      ny: 0,
      direction: null,
      intensity: 0,
      progress: 0,
      committed: true,
    });
    this.onSwipeCommit?.(direction);
  }

  detachActiveCard(destroyDom = false) {
    if (!this.activeCard) return;
    const state = this.activeCard;
    this.activeCard = null;
    state.cleanupListeners?.();
    if (state.mouseJoint) {
      this.world.destroyJoint(state.mouseJoint);
    }
    this.world.destroyBody(state.body);
    if (destroyDom) {
      state.el.remove();
    }
  }

  step(dt) {
    // 1. Apply forces on active card
    if (this.activeCard) {
      const state = this.activeCard;
      const { body } = state;
      const pos = body.getPosition();
      const vel = body.getLinearVelocity();
      const angle = body.getAngle();
      const angVel = body.getAngularVelocity();
      const mass = body.getMass();
      const inertia = Math.max(body.getInertia(), 0.2);

      if (state.mode === 'dragging') {
        // Subtle thumb-pad rotational resistance so card tilts organically (±18°) without spinning upside down
        const softTorque = (-10.5 * angle - 2.2 * angVel) * inertia;
        body.applyTorque(softTorque, true);
      } else if (state.mode === 'returning') {
        // Critically-damped physical spring pulling card back to (0, 0, 0rad) inside Planck.js
        const omega = 17.5;
        const fx = (-omega * omega * pos.x - 2 * omega * vel.x) * mass;
        const fy = (-omega * omega * pos.y - 2 * omega * vel.y) * mass;
        body.applyForceToCenter(new Vec2(fx, fy), true);

        const omegaRot = 18.0;
        const torque = (-omegaRot * omegaRot * angle - 2 * omegaRot * angVel) * inertia;
        body.applyTorque(torque, true);

        if (
          Math.hypot(pos.x, pos.y) < 0.0015 &&
          Math.hypot(vel.x, vel.y) < 0.015 &&
          Math.abs(angle) < 0.002
        ) {
          body.setPosition(new Vec2(0, 0));
          body.setAngle(0);
          body.setLinearVelocity(new Vec2(0, 0));
          body.setAngularVelocity(0);
          state.mode = 'idle';
        }
      }
    }

    // 2. Advance Planck.js world with real frame dt (clamped to avoid explosion on tab restore)
    this.world.step(dt, 8, 3);

    // 3. Sync active card DOM transform & directional indicators directly (no inherited CSS variables)
    if (this.activeCard) {
      const state = this.activeCard;
      const pos = state.body.getPosition();
      const angle = prefersReducedMotion() ? 0 : state.body.getAngle();
      const dx = pos.x * PPM;
      const dy = pos.y * PPM;

      state.el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;

      const nx = dx / state.threshX;
      const ny = dy / state.threshY;
      const absX = Math.abs(nx);
      const absY = Math.abs(ny);

      let direction = null;
      let intensity = 0;
      if (absX > 0.06 || absY > 0.06) {
        if (absX >= absY) {
          direction = nx >= 0 ? 'right' : 'left';
          intensity = Math.min(absX, 1.2);
        } else {
          direction = ny < 0 ? 'up' : 'down';
          intensity = Math.min(absY, 1.2);
        }
      }

      // Update on-card directional glass stamps (starting from scale >= 0.92, never scale(0))
      for (const [dir, stampEl] of Object.entries(state.stamps)) {
        if (!stampEl) continue;
        if (dir === direction && intensity > 0.08) {
          const alpha = Math.min(1, (intensity - 0.08) / 0.72);
          const sc = 0.92 + 0.08 * alpha;
          stampEl.style.opacity = alpha.toFixed(3);
          stampEl.style.transform = `scale(${sc.toFixed(3)})`;
        } else {
          stampEl.style.opacity = '0';
          stampEl.style.transform = 'scale(0.92)';
        }
      }

      const overallProgress = Math.min(1, Math.max(absX, absY));
      this.onDragProgress?.({
        nx,
        ny,
        direction,
        intensity,
        progress: overallProgress,
        committed: false,
      });
    }

    // 4. Advance & clean up exiting cards in Planck.js
    for (let i = this.exitingCards.length - 1; i >= 0; i -= 1) {
      const item = this.exitingCards[i];
      item.elapsed += dt;
      const pos = item.body.getPosition();
      const angle = prefersReducedMotion() ? 0 : item.body.getAngle();
      item.el.style.transform = `translate3d(${(pos.x * PPM).toFixed(1)}px, ${(pos.y * PPM).toFixed(1)}px, 0) rotate(${angle.toFixed(4)}rad)`;

      if (item.elapsed >= item.maxDuration || !item.el.isConnected) {
        this.world.destroyBody(item.body);
        this.exitingCards.splice(i, 1);
      }
    }
  }

  destroy() {
    this.detachActiveCard(false);
    for (const item of this.exitingCards) {
      this.world.destroyBody(item.body);
    }
    this.exitingCards = [];
  }
}
