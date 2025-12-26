// Web Audio API sound effects
// Simple synthesized sounds - no external files needed

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.audioContext && typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Play a simple beep/tone
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.init();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio isn't available
    }
  }

  // Success sound - ascending arpeggio
  playSuccess() {
    if (!this.enabled) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 80);
    });
  }

  // Complete sound - single pleasant tone
  playComplete() {
    if (!this.enabled) return;
    this.playTone(880, 0.2, 'sine'); // A5
  }

  // Level up sound - triumphant fanfare
  playLevelUp() {
    if (!this.enabled) return;

    const notes = [
      { freq: 523.25, delay: 0 },     // C5
      { freq: 659.25, delay: 100 },   // E5
      { freq: 783.99, delay: 200 },   // G5
      { freq: 1046.50, delay: 300 },  // C6
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine'), delay);
    });
  }

  // Perfect day sound - celebratory
  playPerfectDay() {
    if (!this.enabled) return;

    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 100 },
      { freq: 783.99, delay: 200 },
      { freq: 1046.50, delay: 300 },
      { freq: 1318.51, delay: 400 },
      { freq: 1567.98, delay: 500 },
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), delay);
    });
  }

  // Relapse sound - low, somber
  playRelapse() {
    if (!this.enabled) return;

    const notes = [392.00, 349.23, 311.13]; // G4, F4, Eb4
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'triangle'), i * 150);
    });
  }

  // Click/tap feedback
  playTap() {
    if (!this.enabled) return;
    this.playTone(1200, 0.05, 'sine');
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Export individual functions for convenience
export const playSuccess = () => soundManager.playSuccess();
export const playComplete = () => soundManager.playComplete();
export const playLevelUp = () => soundManager.playLevelUp();
export const playPerfectDay = () => soundManager.playPerfectDay();
export const playRelapse = () => soundManager.playRelapse();
export const playTap = () => soundManager.playTap();
export const setSoundEnabled = (enabled) => soundManager.setEnabled(enabled);
export const setSoundVolume = (volume) => soundManager.setVolume(volume);
