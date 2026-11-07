/**
 * Tactile Haptic Feedback Controller (Vibration API)
 *
 * Provides subtle, authentic physical feedback for:
 * 1. "grab" — when the user's finger latches onto the active card
 * 2. "swipe-*" — when a card is committed in any of the 4 directions (gesture or button)
 *
 * Gracefully silent on devices/browsers without Vibration API support.
 */

export function triggerHaptic(type = 'grab') {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }

  try {
    switch (type) {
      case 'grab':
        // Crisp micro-tick when latching onto the card
        navigator.vibrate(14);
        break;

      case 'swipe-right':
        // Rewarding double pulse for Save
        navigator.vibrate([16, 32, 22]);
        break;

      case 'swipe-left':
        // Distinct firm pulse for Pass
        navigator.vibrate(20);
        break;

      case 'swipe-up':
        // Energetic double burst for Favorite
        navigator.vibrate([18, 36, 28]);
        break;

      case 'swipe-down':
        // Soft single tick for Next
        navigator.vibrate(15);
        break;

      case 'swipe':
      default:
        navigator.vibrate(18);
        break;
    }
  } catch {
    // Non-blocking fallback
  }
}
