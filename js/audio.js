// js/audio.js
// Procedural Music Box Synth using Web Audio API
// Synthesizes a cute, dreamy arpeggio melody to avoid loading external assets.

class MusicBox {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.4; // Default volume: low and gentle
    this.timerId = null;
    this.currentNoteIndex = 0;
    this.bpm = 90;
    this.noteLength = 60 / this.bpm / 2; // Eighth notes (approx 0.33s per note)
    
    // Dreamy Lullaby Melody in C major / F major / G major / A minor
    // Each element: [midiNote, octaveShift] or null for rest
    // A nice, slow emotional melody
    this.melody = [
      64, 67, 71, 72, 76, 74, 71, 67, // Cmaj7 arpeggio ascending/descending
      60, 64, 67, 69, 72, 71, 67, 64, // Am7 arpeggio
      65, 69, 72, 74, 77, 76, 72, 69, // Fmaj7 arpeggio
      67, 71, 74, 76, 79, 77, 74, 71, // G7 arpeggio
      76, 72, 79, 76, 81, 79, 76, 72, // Em7 -> Am7 peak
      74, 71, 77, 74, 79, 76, 74, 67, // Dm7 -> G7 peak
      72, 67, 64, 60, 64, 67, 72, null, // Resolution
      79, 74, 71, 67, 71, 74, 79, null  // Secondary Resolution
    ];
  }

  init() {
    if (this.ctx) return;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create Master Gain Node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Synthesize a single music box pluck
  playPluck(note, time) {
    if (!this.ctx || this.isMuted) return;

    const freq = this.midiToFreq(note);
    
    // 1. Primary Tine (Oscillator 1 - Triangle wave for warm body)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // 2. High Metallic Resonant Ping (Oscillator 2 - Sine wave at higher harmonic)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    // 4x frequency (2 octaves up) for the metallic chime pluck sound
    osc2.frequency.setValueAtTime(freq * 4, time);

    // 3. Gain nodes for envelope shaping
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    // Envelope for Primary Tine: Instant attack, fast decay to low sustain, long release
    gain1.gain.setValueAtTime(0, time);
    gain1.gain.linearRampToValueAtTime(0.25, time + 0.005); // Rapid pluck attack
    gain1.gain.exponentialRampToValueAtTime(0.08, time + 0.15); // Fast decay
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 2.0); // Slow release

    // Envelope for Metallic Ping: Instant attack, very short ring out
    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(0.12, time + 0.002);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.2); // Ringer dies out quickly

    // Connect them
    osc1.connect(gain1);
    gain1.connect(this.masterGain);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    // Start & Stop
    osc1.start(time);
    osc1.stop(time + 2.1);
    
    osc2.start(time);
    osc2.stop(time + 0.25);
  }

  // Synthesizes a quick, playful pop/bubble sound for sticker stamps
  playPopSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const time = this.ctx.currentTime;
    
    // Create oscillator and gain
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    
    // Frequency sweep: start at low (180Hz) and sweep up rapidly to high (550Hz)
    // This creates a cute "plop" or "bubble pop" sound!
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(550, time + 0.08);
    
    // Volume envelope: rapid attack, quick decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(this.volume * 0.5, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Synthesizes a cute cartoon "smooch" kiss sound effect
  playKissSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const time = this.ctx.currentTime;
    
    // Tone 1: The suction friction sweep (rising quickly)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(300, time);
    osc1.frequency.exponentialRampToValueAtTime(1200, time + 0.06);
    
    gain1.gain.setValueAtTime(0, time);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.4, time + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    
    // Tone 2: The release pop (descending/stabilizing pop)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, time + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(350, time + 0.12);
    
    gain2.gain.setValueAtTime(0, time + 0.05);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.5, time + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc1.start(time);
    osc1.stop(time + 0.07);
    
    osc2.start(time + 0.05);
    osc2.stop(time + 0.13);
  }

  // Melodic scheduler loop
  scheduler() {
    // Schedule ahead by 0.1s to avoid audio glitching/stuttering
    const scheduleAheadTime = 0.1;
    
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      const note = this.melody[this.currentNoteIndex];
      if (note !== null && note !== undefined) {
        this.playPluck(note, this.nextNoteTime);
      }
      
      this.nextNoteTime += this.noteLength;
      
      // Loop the melody
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    }
    
    // Call scheduler recursively
    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  play() {
    this.init();
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setMute(muteState) {
    this.isMuted = muteState;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

// Global instance
const musicBox = new MusicBox();
window.musicBox = musicBox;
