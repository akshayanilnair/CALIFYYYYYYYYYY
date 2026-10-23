/**
 * Calmify Kinetic Web Audio Synthesizer
 * Generates continuous organic ambient harmonic soundscapes (432Hz / 528Hz Solfeggio)
 * and acoustic singing bowl chimes using the Web Audio API
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isAmbiencePlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientGains: GainNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Toggle continuous generative ambient drone (432Hz deep root + 528Hz harmonic overtone)
   */
  public toggleAmbience(): boolean {
    this.initContext();
    if (!this.ctx || !this.masterGain) return false;

    if (this.isAmbiencePlaying) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  public getIsAmbiencePlaying(): boolean {
    return this.isAmbiencePlaying;
  }

  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;
    this.stopAmbience();

    // Harmonics: 432Hz (earth resonance), 216Hz (deep root), 528Hz (solfeggio tone)
    const frequencies = [108, 216, 432, 528];
    const gains = [0.08, 0.06, 0.04, 0.02];

    frequencies.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle slow frequency modulation (chorus/warmth)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gains[i], this.ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.ambientOscs.push(osc);
      this.ambientGains.push(gain);
    });

    // Gentle soft pink noise / rain breeze bed
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let j = 0; j < bufferSize; j++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[j] = (b0 + b1 + b2) * 0.03;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.noiseGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 4);

      // Filter to keep only warm low frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);
      this.noiseNode.start();
    } catch {
      // Noise buffer fallback
    }

    this.isAmbiencePlaying = true;
  }

  public stopAmbience() {
    if (this.ctx) {
      this.ambientGains.forEach(g => {
        try {
          g.gain.linearRampToValueAtTime(0.0001, this.ctx!.currentTime + 1.5);
        } catch {}
      });

      if (this.noiseGain) {
        try {
          this.noiseGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
        } catch {}
      }

      setTimeout(() => {
        this.ambientOscs.forEach(o => {
          try { o.stop(); } catch {}
        });
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch {}
        }
        this.ambientOscs = [];
        this.ambientGains = [];
        this.noiseNode = null;
        this.noiseGain = null;
      }, 1600);
    }
    this.isAmbiencePlaying = false;
  }

  /**
   * Play crystal singing bowl chime
   */
  public playBowlChime(pitch: number = 432, duration: number = 2.8) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.998, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playBreathTick(type: 'inhale' | 'hold' | 'exhale') {
    const pitch = type === 'inhale' ? 528 : type === 'hold' ? 440 : 396;
    this.playBowlChime(pitch, 2.2);
  }
}

export const sound = new AudioSynthesizer();
