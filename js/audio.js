/**
 * Kozminski Escape: Polowanie na ECTS
 * Moduł dźwiękowy: SoundSystem
 * Syntetyzator 8-bitowych efektów retro oparty wyłącznie o Web Audio API
 * (AudioContext, OscillatorNode, GainNode) - 0 zewnętrznych plików audio.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
  }

  /**
   * Inicjalizacja kontekstu audio (wymaga interakcji użytkownika w nowoczesnych przeglądarkach)
   */
  init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn('[SoundSystem] Web Audio API nie jest wspierane:', err);
    }
  }

  /**
   * Wznowienie kontekstu, jeśli był uśpiony przez politykę autoplay
   */
  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Przełącznik wyciszenia (mute/unmute)
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Główny interfejs odtwarzania efektów dźwiękowych
   * @param {'ects' | 'coffee' | 'shield' | 'freeze' | 'hit' | 'win'} type 
   */
  play(type) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (type) {
      case 'ects':
        this.playEcts();
        break;
      case 'coffee':
        this.playCoffee();
        break;
      case 'shield':
        this.playShield();
        break;
      case 'freeze':
        this.playFreeze();
        break;
      case 'hit':
        this.playHit();
        break;
      case 'win':
        this.playWin();
        break;
      default:
        console.warn(`[SoundSystem] Nieznany typ efektu: ${type}`);
    }
  }

  // --------------------------------------------------------------------------
  // 1. 'ects': melodyjny, wysoki dwuton monety (trójkątna fala)
  // --------------------------------------------------------------------------
  playEcts() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Pierwszy ton monety: B5 (987.77 Hz), po chwili skok do E6 (1318.51 Hz)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    // Dynamiczna obwiednia głośności (szybki atak i łagodne wybrzmienie)
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.setValueAtTime(0.24, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // --------------------------------------------------------------------------
  // 2. 'coffee': dźwięk przyspieszenia (rosnąca częstotliwość fali piłokształtnej)
  // --------------------------------------------------------------------------
  playCoffee() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Gwałtowny sweep częstotliwości w górę (220 Hz -> 920 Hz)
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.28);

    // Obwiednia głośności
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // --------------------------------------------------------------------------
  // 3. 'shield': aktywacja tarczy legitymacji studenckiej (akord sinusoidalny)
  // --------------------------------------------------------------------------
  playShield() {
    const now = this.ctx.currentTime;
    // Czysty, rezonujący akord durowy (C5, E5, G5, C6) na fali sinusoidalnej
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50];

    chordFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Delikatna wibracja tarczy ochronnej (subtelne mikro-odstrojenie)
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.35);

      const delay = idx * 0.025;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + 0.45);
    });
  }

  // --------------------------------------------------------------------------
  // 4. 'freeze': cybernetyczny paraliż profesora przez AI (fala prostokątna)
  // --------------------------------------------------------------------------
  playFreeze() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';

    // Szybkie naprzemienne skoki arpeggio AI/cybernetycznego paraliżu
    const steps = [880, 440, 1100, 330, 960, 220, 1320, 180];
    const stepDuration = 0.035;

    steps.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + i * stepDuration);
    });

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + steps.length * stepDuration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + steps.length * stepDuration);
  }

  // --------------------------------------------------------------------------
  // 5. 'hit': faul/przegrana (dramatycznie opadający bas)
  // --------------------------------------------------------------------------
  playHit() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Głęboka fala piłokształtna przechodząca w trójkątną
    osc.type = 'sawtooth';
    // Dramatyczny spadek częstotliwości z 280 Hz do sub-basowych 38 Hz
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.42);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // --------------------------------------------------------------------------
  // 6. 'win': krótka, triumfalna 4-tonowa fanfara zaliczenia sesji
  // --------------------------------------------------------------------------
  playWin() {
    const now = this.ctx.currentTime;
    // Triumfalna progresja 4-tonowa: C5 -> E5 -> G5 -> C6 (z wydłużeniem finału)
    const fanfareNotes = [
      { freq: 523.25, start: 0.00, duration: 0.11 }, // C5
      { freq: 659.25, start: 0.12, duration: 0.11 }, // E5
      { freq: 783.99, start: 0.24, duration: 0.11 }, // G5
      { freq: 1046.50, start: 0.36, duration: 0.42 }, // C6 (długie wybrzmienie)
    ];

    fanfareNotes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Fala trójkątna dla ciepłego, dzwonkowego brzmienia arkadowego
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0.24, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });
  }

  // --- Metody statyczne dla bezpośredniego wywołania SoundSystem.play(...) ---
  static init() {
    if (!window.soundSystem) window.soundSystem = new SoundSystem();
    window.soundSystem.init();
  }

  static play(type) {
    if (!window.soundSystem) window.soundSystem = new SoundSystem();
    window.soundSystem.play(type);
  }

  static toggleMute() {
    if (!window.soundSystem) window.soundSystem = new SoundSystem();
    return window.soundSystem.toggleMute();
  }

  // --- Kompatybilność z dotychczasowymi odwołaniami ---
  playPickupEcts() { this.play('ects'); }
  playCoffeeBoost() { this.play('coffee'); }
  playGoldenLion() { this.play('shield'); }
  playGameOver() { this.play('hit'); }
  playVictory() { this.play('win'); }
  playProfessorAlert() { this.play('freeze'); }
}

// Globalne instancje modułu dźwiękowego
window.SoundSystem = SoundSystem;
window.soundSystem = new SoundSystem();
window.gameAudio = window.soundSystem; // Aliasing dla kompatybilności
