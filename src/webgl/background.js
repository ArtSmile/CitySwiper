import { animate, utils } from 'animejs';
import createREGL from 'regl';
import noise3D from '../shaders/noise3D.js';
import { EASE_UI_OUT, onReducedMotionChange, prefersReducedMotion } from '../ui/animations.js';

/**
 * Luminous Daylight Silk 4-Directional WebGL Simplex Noise Background (AGENTS.md Rule 3)
 * Uses regl + Ashima 3D Simplex Noise (src/shaders/noise3D.glsl).
 *
 * Directional reaction modes (high-key pastel watercolor & silk wave physics):
 * 1. Left  (dx < 0, Не моё)      -> Rose-quartz / coral blush + crisper airy ripples
 * 2. Right (dx > 0, Хочу)        -> Morning seafoam / mint dew + expansive harmonic silk waves
 * 3. Up    (dy < 0, Избранное)   -> Buoyant iris-lavender & sunlit gold crest + ascending silk columns
 * 4. Down  (dy > 0, Уже бывал)   -> Serene sky-mist & warm apricot-sand + slow enveloping laminar drift
 */
export function createReactiveBackground() {
  const canvas = document.createElement('canvas');
  canvas.className = 'webgl-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

  let regl = null;
  try {
    regl = createREGL({
      canvas,
      pixelRatio: getPixelRatio(),
      attributes: {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: 'low-power',
      },
    });
  } catch {
    // Graceful fallback if headless/WebGL unavailable
    return {
      setDragVector() {},
      pulseDirection() {},
      step() {},
      destroy() {
        canvas.remove();
      },
    };
  }

  const targetDrag = { x: 0, y: 0 };
  const smoothDrag = { x: 0, y: 0 };
  const impulse = { x: 0, y: 0 };
  let simTime = 0;
  let reducedMotion = prefersReducedMotion();

  onReducedMotionChange((isReduced) => {
    reducedMotion = isReduced;
  });

  const resizeCanvas = () => {
    const dpr = getPixelRatio();
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const drawBackdrop = regl({
    vert: `
      precision mediump float;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    frag: `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uDrag;
      uniform float uReduced;

      ${noise3D}

      void main() {
        vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
        vec2 centered = (vUv - 0.5) * aspect;

        // Directional weights in [0..1.25]
        // uDrag.y < 0 -> finger pulls UP on screen; uDrag.y > 0 -> finger pulls DOWN
        float wLeft  = clamp(-uDrag.x, 0.0, 1.25);
        float wRight = clamp(uDrag.x, 0.0, 1.25);
        float wUp    = clamp(-uDrag.y, 0.0, 1.25);
        float wDown  = clamp(uDrag.y, 0.0, 1.25);
        float mag    = clamp(length(uDrag), 0.0, 1.25);

        // Wide, airy spatial scale + 4-way directional dispersion:
        // Left: finer dispersed cloudlets; Right: broad harmonic mist; Up: ascending veil; Down: ultra-wide calm drift
        float baseScale = 0.86
          + wLeft  * 0.34
          - wRight * 0.16
          + wUp    * 0.14
          - wDown  * 0.22;

        vec2 flowOffset = vec2(
          (wRight * 0.34 - wLeft * 0.40) * uTime * 0.24 + uDrag.x * 0.24,
          (wUp * 0.44 - wDown * 0.14) * uTime * 0.24 - uDrag.y * 0.24
        );

        float motionScale = mix(1.0, 0.18, uReduced);
        float zSpeed = (0.048 + wUp * 0.085 + wLeft * 0.055 + wRight * 0.036 - wDown * 0.024) * motionScale;

        vec2 p = centered * baseScale - flowOffset * motionScale;
        p.x *= 1.0 + wUp * 0.16;
        p.y *= 1.0 - wDown * 0.12;

        // Three decorrelated, spatially dispersed simplex noise layers + fine atmospheric grain
        float n1 = snoise(vec3(p * 0.92, uTime * zSpeed));
        vec2 warp = vec2(
          n1 * (0.42 + wRight * 0.24 + wDown * 0.22),
          snoise(vec3(p * 1.08 + vec2(3.7, -2.4), uTime * zSpeed * 0.82)) * (0.42 + wUp * 0.24)
        );

        float n2 = snoise(vec3(p * (1.24 + wLeft * 0.28 - wDown * 0.18) + warp * 0.85 + vec2(-5.1, 4.3), uTime * zSpeed * 1.08 + 7.3));
        float n3 = snoise(vec3(p * 0.64 - warp * 0.60 + vec2(8.4, 2.9), uTime * zSpeed * 0.72 + 15.7));
        float fineMist = snoise(vec3(centered * (2.65 + wLeft * 0.45) + warp * 0.55, uTime * zSpeed * 1.35 + 23.1));

        // Feathered, wide hermite blending so clouds diffuse softly with zero hard contour ridges
        float rawField = n1 * 0.44 + n2 * 0.34 + n3 * 0.22 + fineMist * 0.06;
        float structuredMist = smoothstep(-0.78, 0.82, rawField);
        float ultraDiffused  = smoothstep(-1.12, 1.12, rawField);
        float softness = clamp(0.76 + wRight * 0.14 + wDown * 0.18 - wLeft * 0.18, 0.54, 0.97);
        float field = mix(structuredMist, ultraDiffused, softness);

        // Idle weightless porcelain & pearlescent morning-mist palette
        vec3 colBase  = vec3(0.963, 0.975, 0.993); // #f6f9fd cool porcelain air
        vec3 colWave  = vec3(0.922, 0.943, 0.985); // #ebf0fb diffused sky-pearl mist
        vec3 colCrest = vec3(0.993, 0.996, 1.000); // #fdfeff soft silk veil

        // 1. Left (Не моё): diffused pastel rose-quartz & petal blush mist
        colBase  = mix(colBase,  vec3(0.993, 0.961, 0.968), clamp(wLeft * 0.84, 0.0, 1.0));
        colWave  = mix(colWave,  vec3(0.988, 0.884, 0.908), clamp(wLeft * 0.82, 0.0, 1.0));
        colCrest = mix(colCrest, vec3(0.986, 0.762, 0.812), clamp(wLeft * 0.78, 0.0, 1.0));

        // 2. Right (Хочу): airy seafoam mist & pastel mint dew
        colBase  = mix(colBase,  vec3(0.952, 0.990, 0.974), clamp(wRight * 0.84, 0.0, 1.0));
        colWave  = mix(colWave,  vec3(0.854, 0.964, 0.916), clamp(wRight * 0.82, 0.0, 1.0));
        colCrest = mix(colCrest, vec3(0.645, 0.928, 0.815), clamp(wRight * 0.78, 0.0, 1.0));

        // 3. Up (Избранное): soft iris-lavender & diffused champagne-sunlight mist
        colBase  = mix(colBase,  vec3(0.964, 0.960, 0.996), clamp(wUp * 0.84, 0.0, 1.0));
        colWave  = mix(colWave,  vec3(0.892, 0.878, 0.992), clamp(wUp * 0.82, 0.0, 1.0));
        colCrest = mix(colCrest, vec3(0.992, 0.896, 0.675), clamp(wUp * 0.78, 0.0, 1.0));

        // 4. Down (Уже бывал): tranquil sky-mist & warm apricot-sand veil
        colBase  = mix(colBase,  vec3(0.954, 0.976, 0.996), clamp(wDown * 0.84, 0.0, 1.0));
        colWave  = mix(colWave,  vec3(0.868, 0.926, 0.990), clamp(wDown * 0.82, 0.0, 1.0));
        colCrest = mix(colCrest, vec3(0.988, 0.882, 0.755), clamp(wDown * 0.76, 0.0, 1.0));

        vec3 color = mix(colBase, colWave, field);
        float dispersedBloom = smoothstep(-0.28, 1.08, field + n2 * 0.16 + n3 * 0.14);
        color = mix(color, colCrest, dispersedBloom * (0.34 + mag * 0.30));

        // Two wide, dispersed watercolor aura lobes instead of a concentrated spotlight
        vec2 glowA = vec2(0.5, 0.52) + vec2(uDrag.x * 0.22, -uDrag.y * 0.20) + warp * 0.12;
        vec2 glowB = vec2(0.5, 0.48) - vec2(uDrag.x * 0.14, -uDrag.y * 0.14) - warp * 0.10;
        float haloA = smoothstep(1.06, 0.0, distance(vUv, glowA));
        float haloB = smoothstep(0.98, 0.0, distance(vUv, glowB));
        color = mix(color, colCrest, (haloA * 0.62 + haloB * 0.38) * (0.12 + mag * 0.20));

        // Gentle atmospheric cushion behind card center so white porcelain floats weightlessly
        float centerCushion = smoothstep(0.84, 0.02, length(centered));
        color = mix(color, colWave, centerCushion * 0.12 * (1.0 - clamp(mag, 0.0, 0.75)));

        // Imperceptible sub-bit optical dither prevents 8-bit Mach banding on ultra-soft gradients
        float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        color += dither * (1.15 / 255.0);

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `,
    attributes: {
      position: [
        [-1, -1],
        [3, -1],
        [-1, 3],
      ],
    },
    uniforms: {
      uTime: () => simTime,
      uResolution: ({ drawingBufferWidth, drawingBufferHeight }) => [
        drawingBufferWidth,
        drawingBufferHeight,
      ],
      uDrag: () => [
        smoothDrag.x + impulse.x,
        smoothDrag.y + impulse.y,
      ],
      uReduced: () => (reducedMotion ? 1.0 : 0.0),
    },
    count: 3,
  });

  return {
    /**
     * Normalized drag vector from active card physics:
     * nx in [-1.2 .. 1.2] (left < 0, right > 0)
     * ny in [-1.2 .. 1.2] (up < 0, down > 0)
     */
    setDragVector(nx, ny) {
      targetDrag.x = Math.max(-1.25, Math.min(1.25, nx));
      targetDrag.y = Math.max(-1.25, Math.min(1.25, ny));
    },

    /**
     * Smooth Anime.js directional wave when committing a swipe or pressing an action button
     */
    pulseDirection(direction) {
      const vectors = {
        left: { x: -0.72, y: 0 },
        right: { x: 0.72, y: 0 },
        up: { x: 0, y: -0.72 },
        down: { x: 0, y: 0.66 },
      };
      const vec = vectors[direction];
      if (!vec) return;

      utils.remove(impulse);
      impulse.x = vec.x * 0.45;
      impulse.y = vec.y * 0.45;
      animate(impulse, {
        x: [vec.x, 0],
        y: [vec.y, 0],
        duration: reducedMotion ? 240 : 660,
        ease: EASE_UI_OUT,
      });
    },

    step(dt) {
      if (document.hidden) return;
      simTime += dt;
      // Gentle exponential smoothing for airy, dispersed mist interpolation without jumps
      const alpha = 1 - Math.exp(-7.2 * dt);
      smoothDrag.x += (targetDrag.x - smoothDrag.x) * alpha;
      smoothDrag.y += (targetDrag.y - smoothDrag.y) * alpha;

      regl.poll();
      drawBackdrop();
    },

    destroy() {
      window.removeEventListener('resize', resizeCanvas);
      regl.destroy();
      canvas.remove();
    },
  };
}
