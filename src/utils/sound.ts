// Enhanced audio, mobile vibration, and push notification engine
// Designed for cross-platform reliability on mobile phones (Android, iOS) and desktop computers.

export type PushPermissionResult = 'granted' | 'denied' | 'default' | 'unsupported' | 'iframe_blocked';

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Initialize and unlock audio on first user touch / click (crucial for mobile Safari & Chrome)
export const initAudioUnlock = (): void => {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioContextClass();
      }

      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      } else {
        isAudioUnlocked = true;
      }
    } catch (e) {
      console.warn('[Sound] Audio unlock notice:', e);
    }
  };

  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('touchend', unlock, { once: true, passive: true });
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
};

// Play melodic cash-register / boutique bell chime with mobile resilience
export const playNotificationChime = (): void => {
  // 1. Always vibrate phone immediately if supported (even if audio is muted or restricted)
  vibrateDevice([300, 120, 300, 120, 500]);

  // 2. Play Web Audio Melodic Chime
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }

    const ctx = sharedAudioCtx;

    // Force resume on touch/interaction context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic 3-tone bright chime: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz)
    const tones = [
      { freq: 1046.5, start: 0, duration: 0.28, gain: 0.28 },
      { freq: 1318.51, start: 0.1, duration: 0.32, gain: 0.32 },
      { freq: 1567.98, start: 0.22, duration: 0.55, gain: 0.38 }
    ];

    tones.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.001, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });

  } catch (e) {
    console.warn('[Sound] Web Audio play notice:', e);
  }
};

// Vibrate mobile device (silent physical alert)
export const vibrateDevice = (pattern: number[] = [300, 100, 300]): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
};

// Request push notification permission with comprehensive feedback
export const getPushPermissionStatus = (): PushPermissionResult => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as PushPermissionResult;
};

export const requestPushPermission = async (): Promise<PushPermissionResult> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission as PushPermissionResult;
  } catch (err) {
    console.warn('[Push] Permission request blocked or in iframe:', err);
    return 'iframe_blocked';
  }
};

// Send browser / system push notification (with ServiceWorker support for Android)
export const sendPushNotification = async (title: string, body: string, icon = '/logo.png'): Promise<void> => {
  // Mobile vibration
  vibrateDevice([300, 120, 300, 120, 500]);

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    body,
    icon: icon || '/logo.png',
    badge: icon || '/logo.png',
    vibrate: [300, 120, 300, 120, 500],
    tag: 'aura-order-alert',
    renotify: true,
    requireInteraction: true
  };

  // 1. Try Service Worker first (Required on Android Chrome to avoid "Illegal constructor" error)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    } catch (swErr) {
      console.warn('[Push] ServiceWorker notification fallback:', swErr);
    }
  }

  // 2. Desktop Browser Notification fallback
  try {
    new Notification(title, options);
  } catch (winErr) {
    console.warn('[Push] Window Notification error:', winErr);
  }
};
