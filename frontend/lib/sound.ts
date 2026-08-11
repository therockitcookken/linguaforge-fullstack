// Web Audio API Sound Synthesizer for LinguaForge UI & Learning Feedback

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // Lazy audio context instantiation on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public play(type: 'click' | 'flip' | 'correct' | 'incorrect' | 'complete' | 'streak' | 'aiConnect' | 'aiDisconnect' | 'favorite' | 'frequency', freq?: number) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'flip':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.linearRampToValueAtTime(450, now + 0.08);
          gain.gain.setValueAtTime(this.volume * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'correct':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
          gain.gain.setValueAtTime(this.volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'incorrect':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(180, now + 0.1);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'complete':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1);
          osc.frequency.setValueAtTime(659.25, now + 0.2);
          osc.frequency.setValueAtTime(880, now + 0.3);
          gain.gain.setValueAtTime(this.volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;

        case 'streak':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
          gain.gain.setValueAtTime(this.volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'aiConnect':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'aiDisconnect':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'favorite':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(1050, now + 0.1);
          gain.gain.setValueAtTime(this.volume * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;

        case 'frequency':
          const f = freq || 440;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(this.volume * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
      }
    } catch (e) {
      console.warn("Web Audio play error:", e);
    }
  }
}

export const soundEngine = new SoundEngine();
export const uiSound = (typeOrFreq: any = 'click') => {
  if (typeof typeOrFreq === 'number') {
    soundEngine.play('frequency', typeOrFreq);
  } else {
    soundEngine.play(typeOrFreq);
  }
};