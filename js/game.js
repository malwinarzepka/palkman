/**
 * Kozminski Escape: Polowanie na ECTS
 * Główny silnik gry 2D na Canvas (800x540)
 * Akademia Leona Koźmińskiego (ALK)
 */

(() => {
  // --- Elementy DOM ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // HUD
  const ectsCounter = document.getElementById('ectsCounter');
  const ectsProgressBar = document.getElementById('ectsProgressBar');
  const staminaProgressBar = document.getElementById('staminaProgressBar');
  const staminaPercent = document.getElementById('staminaPercent');
  const timerDisplay = document.getElementById('timerDisplay');
  const statusMessage = document.getElementById('statusMessage');
  const statusText = document.getElementById('statusText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const pauseToggleBtn = document.getElementById('pauseToggleBtn');
  const pauseIcon = document.getElementById('pauseIcon');
  const retroToggleBtn = document.getElementById('retroToggleBtn');
  const retroHudBadge = document.getElementById('retroHudBadge');

  // Tryb Ultra-Retro w modalu
  const retroModeCheckbox = document.getElementById('retroModeCheckbox');
  const retroPillStatus = document.getElementById('retroPillStatus');
  const retroModeDesc = document.getElementById('retroModeDesc');
  const freezeLegendIcon = document.getElementById('freezeLegendIcon');
  const freezeLegendTitle = document.getElementById('freezeLegendTitle');
  const freezeLegendText = document.getElementById('freezeLegendText');

  // Dymek profesora
  const profSpeech = document.getElementById('profSpeech');
  const profDialogText = document.getElementById('profDialogText');

  // Modale
  const startModal = document.getElementById('startModal');
  const startGameBtn = document.getElementById('startGameBtn');
  const gameOverModal = document.getElementById('gameOverModal');
  const restartGameBtn = document.getElementById('restartGameBtn');
  const victoryModal = document.getElementById('victoryModal');
  const playAgainBtn = document.getElementById('playAgainBtn');

  // Statystyki w modalach
  const failEctsCollected = document.getElementById('failEctsCollected');
  const failSurvivalTime = document.getElementById('failSurvivalTime');
  const failCoffeesDrunk = document.getElementById('failCoffeesDrunk');
  const failQuote = document.getElementById('failQuote');

  const victoryEcts = document.getElementById('victoryEcts');
  const victoryTime = document.getElementById('victoryTime');
  const victoryRating = document.getElementById('victoryRating');

  // Przyciski dotykowe
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');
  const touchSprint = document.getElementById('touchSprint');

  // --- Cytaty Egzaminatora ---
  const PROF_QUOTES = [
    '„Widzę Pana! Proszę podejść z indeksem i kartą zaliczeń!”',
    '„Gdzie jest Pana bibliografia do eseju końcowego?!”',
    '„Czerwony długopis już na Pana czeka!”',
    '„Pana frekwencja na wykładach budzi moje wątpliwości!”',
    '„Zaraz dopiszę dwóję do systemu USOS!”',
    '„Termin zerówkowy dawno minął, proszę pana!”',
    '„Poproszę legitymację studencką Akademii!”',
    '„Na Patio nie uciekniesz przed kolokwium!”',
  ];

  // Cytaty przy czytaniu gazety przez profesora (Ultra-Retro)
  const NEWSPAPER_QUOTES = [
    '„(Szelest gazety) ...O, fascynujący felieton o fuzjach i przejęciach!”',
    '„Nie rozmawiać tam! Muszę w spokoju doczytać notowania giełdowe!”',
    '„Hmm, 6 liter na »postrach studentów w sesji«... czyżby Kolokwium?”',
    '„Zaraz skończę czytać stronę redakcyjną! Ani mi się ważcie ściągać!”',
    '„(Chowa głowę za gazetą) ...W ciszy pisać, wszystko widzę kątem oka!”',
    '„Świetny dodatek prawniczy w dzisiejszym wydaniu... Piszcie sami!”',
  ];

  // Cytaty przy paraliżu Gemini AI (Tryb standardowy)
  const GEMINI_QUOTES = [
    '„Co to za prompt w Gemini AI?! Mój algorytm oceniania się zawiesił!”',
    '„Gemini wygenerowało referat w 3 sekundy?! Niemożliwe, muszę to sprawdzić!”',
    '„Błąd w przypisach! Sieć neuronowa Gemini zablokowała arkusz ocen!”',
    '„Czy ten esej pisał student czy multimodalny model Gemini?!”',
  ];

  // Reakcje profesora gdy student ściąga tuż obok czytającego egzaminatora
  const CHEAT_REACTIONS = [
    '„Coś tam szura w ławkach? E, pewnie przeciąg z korytarza...”',
    '„(Zza gazety) ...Słyszę przewracanie kartek! Pewnie z mojej gazety...”',
    '„Ciekawe te prognozy stóp procentowych... Piszcie tam, piszcie!”',
    '„(Szelest papieru) ...Jeszcze tylko krzyżówka i zbieram kartki!”',
  ];

  const FAIL_QUOTES = [
    '„Niestety, widzimy się na poprawce we wrześniu. Proszę powtórzyć materiał od pierwszego wykładu!”',
    '„Dwója z wykrzyknikiem wpisana do protokołu. Do zobaczenia w Kampanii Wrześniowej!”',
    '„Brak zaliczenia ćwiczeń. Dziekanat poinformuje Pana o opłacie za powtarzanie semestru!”',
  ];

  // --- Stałe gry ---
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 540;
  const TARGET_ECTS = 30;

  // Mapa korytarzy i Patio ALK (Ściany i przeszkody)
  // Granice: zewnętrzne ściany + pokoje dydaktyczne i sale
  const WALLS = [
    // Zewnętrzne ściany
    { x: 0, y: 0, w: CANVAS_WIDTH, h: 20 },
    { x: 0, y: CANVAS_HEIGHT - 20, w: CANVAS_WIDTH, h: 20 },
    { x: 0, y: 0, w: 20, h: CANVAS_HEIGHT },
    { x: CANVAS_WIDTH - 20, y: 0, w: 20, h: CANVAS_HEIGHT },

    // Skrzydło A (Lewy górny róg - Sala wykładowa)
    { x: 120, y: 20, w: 18, h: 140 },
    { x: 120, y: 160, w: 90, h: 18 },

    // Skrzydło B (Prawy górny róg - Biblioteka ALK)
    { x: 660, y: 20, w: 18, h: 140 },
    { x: 590, y: 160, w: 88, h: 18 },

    // Skrzydło C (Lewy dolny róg - Dziekanat i Bufet)
    { x: 120, y: 380, w: 90, h: 18 },
    { x: 120, y: 380, w: 18, h: 140 },

    // Skrzydło D (Prawy dolny róg - Laboratoria)
    { x: 590, y: 380, w: 88, h: 18 },
    { x: 660, y: 380, w: 18, h: 140 },

    // Centralne Patio - Kolumny i małe murki dekoracyjne
    { x: 260, y: 170, w: 24, h: 24 },
    { x: 516, y: 170, w: 24, h: 24 },
    { x: 260, y: 346, w: 24, h: 24 },
    { x: 516, y: 346, w: 24, h: 24 },

    // Cokół pomnika Lwa w centrum patio (przeszkoda nieprzenikalna)
    { x: 380, y: 250, w: 40, h: 40 },
  ];

  // Obszar Zielonego Patio (dla efektu tła)
  const PATIO_AREA = { x: 230, y: 140, w: 340, h: 260 };

  // --- Stan gry ---
  let gameState = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'
  let ects = 0;
  let stamina = 100;
  let maxStamina = 100;
  let isSprinting = false;
  let coffeeBoostTime = 0;
  let coffeesDrunk = 0;
  let gameStartTime = 0;
  let elapsedTime = 0;
  let speechTimer = 0;
  let particles = [];
  let floatingTexts = [];
  let speechBubbleTimeout = null;

  // Tryb Ultra-Retro i Paraliż (Gazeta vs Gemini AI)
  let isUltraRetro = localStorage.getItem('alk_ultra_retro') === 'true';
  let freezeTimer = 0;
  let lastCheatTime = 0;

  // Przełączanie Trybu Ultra-Retro
  function setUltraRetroMode(enabled) {
    isUltraRetro = Boolean(enabled);
    try {
      localStorage.setItem('alk_ultra_retro', isUltraRetro ? 'true' : 'false');
    } catch (e) {}

    const app = document.getElementById('app');
    if (isUltraRetro) {
      if (app) app.classList.add('ultra-retro');
      document.body.classList.add('ultra-retro');
      if (retroToggleBtn) retroToggleBtn.classList.add('active');
      if (retroHudBadge) retroHudBadge.classList.remove('hidden');
      if (retroModeCheckbox) retroModeCheckbox.checked = true;
      if (retroPillStatus) {
        retroPillStatus.textContent = 'WŁĄCZONY';
        retroPillStatus.style.color = '#fde047';
      }
      if (freezeLegendIcon) freezeLegendIcon.textContent = '📰';
      if (freezeLegendTitle) freezeLegendTitle.textContent = 'Gazeta (Ultra-Retro):';
      if (freezeLegendText) freezeLegendText.textContent = 'Egzaminator czyta gazetę podczas egzaminu i nie patrzy, jak studenci ściągają!';
    } else {
      if (app) app.classList.remove('ultra-retro');
      document.body.classList.remove('ultra-retro');
      if (retroToggleBtn) retroToggleBtn.classList.remove('active');
      if (retroHudBadge) retroHudBadge.classList.add('hidden');
      if (retroModeCheckbox) retroModeCheckbox.checked = false;
      if (retroPillStatus) {
        retroPillStatus.textContent = 'WYŁĄCZONY';
        retroPillStatus.style.color = '';
      }
      if (freezeLegendIcon) freezeLegendIcon.textContent = '✨';
      if (freezeLegendTitle) freezeLegendTitle.textContent = 'Gemini AI:';
      if (freezeLegendText) freezeLegendText.textContent = 'Generuje prompt, który paraliżuje Egzaminatora na 6 sekund!';
    }
    updateHUD();
  }

  // Wejścia klawiatury i dotyku
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
  };

  // --- Obiekty: Gracz (Student) ---
  const player = {
    x: 70,
    y: 70,
    size: 22,
    baseSpeed: 3.3,
    sprintSpeed: 5.6,
    color: '#3b82f6',
    facing: 'down',
    walkCycle: 0,
  };

  // --- Obiekty: Egzaminator (Profesor) ---
  const examiner = {
    x: 720,
    y: 460,
    size: 24,
    baseSpeed: 2.2,
    currentSpeed: 2.2,
    facing: 'left',
    walkCycle: 0,
    rageMode: false,
    penGlow: 0,
  };

  // --- Przedmioty (ECTS, Kawa, Lew) ---
  let items = [];

  // --- Generowanie przedmiotów na mapie ---
  function spawnItem(type) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const itemSize = type === 'lion' ? 22 : (type === 'freeze' ? 18 : 16);
      let x, y;

      if (type === 'lion') {
        // Złoty Lew pojawia się zawsze na Patio
        x = PATIO_AREA.x + 40 + Math.random() * (PATIO_AREA.w - 80);
        y = PATIO_AREA.y + 40 + Math.random() * (PATIO_AREA.h - 80);
      } else {
        x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        y = 40 + Math.random() * (CANVAS_HEIGHT - 80);
      }

      // Sprawdzenie kolizji ze ścianami
      const itemRect = { x: x - itemSize, y: y - itemSize, w: itemSize * 2, h: itemSize * 2 };
      const hitsWall = WALLS.some((wall) => checkAABB(itemRect, wall));
      
      // Nie stawiaj za blisko gracza
      const distToPlayer = Math.hypot(x - player.x, y - player.y);

      if (!hitsWall && distToPlayer > 60) {
        items.push({
          x,
          y,
          size: itemSize,
          type, // 'ects' | 'coffee' | 'lion' | 'freeze'
          bobOffset: Math.random() * Math.PI * 2,
        });
        placed = true;
      }
    }
  }

  function initItems() {
    items = [];
    // 7 indeksów ECTS na start
    for (let i = 0; i < 7; i++) {
      spawnItem('ects');
    }
    // 3 kawy z bufetu ALK
    for (let i = 0; i < 3; i++) {
      spawnItem('coffee');
    }
    // 1 rzadki Złoty Lew
    spawnItem('lion');
    // 1 przedmiot paraliżujący: Gazeta (Ultra-Retro) lub Gemini AI (Normal)
    spawnItem('freeze');
  }

  // --- Narzędzia kolizji ---
  function checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    );
  }

  function canMoveTo(x, y, radius) {
    const box = { x: x - radius, y: y - radius, w: radius * 2, h: radius * 2 };
    for (const wall of WALLS) {
      if (checkAABB(box, wall)) return false;
    }
    return true;
  }

  // --- Dymek wypowiedzi profesora ---
  function showProfQuote(text, soundType = 'freeze') {
    if (!profSpeech || !profDialogText) return;
    profDialogText.textContent = text;
    profSpeech.classList.remove('bubble-hidden');

    if (window.soundSystem && soundType !== 'none') {
      window.soundSystem.play(soundType);
    }

    if (speechBubbleTimeout) clearTimeout(speechBubbleTimeout);
    speechBubbleTimeout = setTimeout(() => {
      profSpeech.classList.add('bubble-hidden');
    }, 3800);
  }

  // --- Resetowanie gry ---
  function resetGame() {
    ects = 0;
    stamina = 100;
    coffeeBoostTime = 0;
    coffeesDrunk = 0;
    gameStartTime = Date.now();
    elapsedTime = 0;
    particles = [];
    floatingTexts = [];
    freezeTimer = 0;
    lastCheatTime = 0;
    speechTimer = 0;

    // Reset pozycji
    player.x = 70;
    player.y = 70;
    player.facing = 'down';

    examiner.x = 720;
    examiner.y = 460;
    examiner.facing = 'left';
    examiner.currentSpeed = examiner.baseSpeed;

    initItems();
    updateHUD();

    if (profSpeech) profSpeech.classList.add('bubble-hidden');
  }

  // --- Rozpoczęcie rozgrywki ---
  function startGame() {
    if (window.soundSystem) {
      window.soundSystem.init();
      window.soundSystem.play('ects');
    }
    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    victoryModal.classList.add('hidden');

    resetGame();
    gameState = 'PLAYING';
    showProfQuote('„Kolokwium zaliczeniowe rozpoczęte! Poproszę indeksy!”');
  }

  // --- Koniec gry: Kampania Wrześniowa ---
  function triggerGameOver() {
    gameState = 'GAMEOVER';
    if (window.soundSystem) {
      window.soundSystem.play('hit');
    }

    // Uzupełnij statystyki
    failEctsCollected.textContent = `${ects} / ${TARGET_ECTS}`;
    failSurvivalTime.textContent = formatTime(elapsedTime);
    failCoffeesDrunk.textContent = coffeesDrunk;
    failQuote.textContent = FAIL_QUOTES[Math.floor(Math.random() * FAIL_QUOTES.length)];

    gameOverModal.classList.remove('hidden');
  }

  // --- Zwycięstwo: Semestr Zaliczony! ---
  function triggerVictory() {
    gameState = 'VICTORY';
    if (window.soundSystem) {
      window.soundSystem.play('win');
    }

    victoryEcts.textContent = `${ects} / ${TARGET_ECTS}`;
    victoryTime.textContent = formatTime(elapsedTime);

    let rating = 'DOBRY (4.0)';
    if (elapsedTime < 60) rating = 'CELUJĄCY Z WYRÓŻNIENIEM (5.5) 🏆';
    else if (elapsedTime < 90) rating = 'BARDZO DOBRY (5.0) ⭐';
    else if (elapsedTime < 130) rating = 'PONADPRZECIĘTNY (4.5)';
    victoryRating.textContent = rating;

    // Utwórz konfetti
    createVictoryConfetti();
    victoryModal.classList.remove('hidden');
  }

  function createVictoryConfetti() {
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        color: ['#f5a623', '#3b82f6', '#22c55e', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 5,
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
      });
    }
  }

  // --- Formatowanie czasu ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Aktualizacja interfejsu (HUD) ---
  function updateHUD() {
    // ECTS
    ectsCounter.textContent = `${ects} / ${TARGET_ECTS}`;
    const ectsRatio = Math.min(100, (ects / TARGET_ECTS) * 100);
    ectsProgressBar.style.width = `${ectsRatio}%`;

    // Stamina
    staminaProgressBar.style.width = `${stamina}%`;
    staminaPercent.textContent = `${Math.round(stamina)}%`;

    // Czas
    timerDisplay.textContent = formatTime(elapsedTime);

    // Status odległości od egzaminatora oraz paraliżu / gazety
    const dist = Math.hypot(player.x - examiner.x, player.y - examiner.y);
    if (freezeTimer > 0) {
      if (isUltraRetro) {
        statusMessage.className = 'hud-status-badge status-retro-freeze';
        statusMessage.style.borderColor = '#f59e0b';
        statusText.textContent = `📰 Profesor czyta gazetę! Ściągaj! (${Math.ceil(freezeTimer)}s)`;
      } else {
        statusMessage.className = 'hud-status-badge status-freeze';
        statusMessage.style.borderColor = '#38bdf8';
        statusText.textContent = `✨ Paraliż Gemini AI aktywny! (${Math.ceil(freezeTimer)}s)`;
      }
    } else if (dist < 180) {
      statusMessage.className = 'hud-status-badge status-alert';
      statusMessage.style.borderColor = '';
      statusText.textContent = 'UWAGA! Egzaminator tuż za Tobą!';
    } else if (coffeeBoostTime > 0) {
      statusMessage.className = 'hud-status-badge';
      statusMessage.style.borderColor = '#f5a623';
      statusText.textContent = `Doładowanie espresso! (${Math.ceil(coffeeBoostTime)}s)`;
    } else {
      statusMessage.className = 'hud-status-badge status-safe';
      statusMessage.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      statusText.textContent = isUltraRetro
        ? 'Tryb Retro: Gazeta paraliżuje profesora!'
        : 'Korytarze czyste. Szukaj ECTS!';
    }
  }

  // --- Aktualizacja logiki gry ---
  function update(dt) {
    if (gameState !== 'PLAYING') return;

    elapsedTime = (Date.now() - gameStartTime) / 1000;

    // Przelicznik kofeiny
    if (coffeeBoostTime > 0) {
      coffeeBoostTime -= dt;
      if (coffeeBoostTime < 0) coffeeBoostTime = 0;
    }

    // Czas paraliżu (Gazeta / Gemini AI)
    if (freezeTimer > 0) {
      freezeTimer -= dt;
      if (freezeTimer <= 0) {
        freezeTimer = 0;
        if (isUltraRetro) {
          showProfQuote('„Koniec czytania prasy! Indeksy na stół, sprawdzam ściągi!”', 'newspaper');
        } else {
          showProfQuote('„Restart systemu oceniania! Widzę Pana znowu!”', 'freeze');
        }
      }
    }

    // Dynamiczne wypowiedzi profesora co kilkanaście sekund (gdy nie czyta gazety)
    speechTimer += dt;
    if (speechTimer > 12 && freezeTimer <= 0) {
      speechTimer = 0;
      const quote = PROF_QUOTES[Math.floor(Math.random() * PROF_QUOTES.length)];
      showProfQuote(quote);
    }

    // Pływające napisy (bonusy ze ściągania, power-upy)
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 22 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
      }
    }

    // --- Ruch Gracza ---
    let dx = 0;
    let dy = 0;

    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    // Normalizacja wektora ruchu
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    // Sprint i Stamina
    isSprinting = keys.sprint && (dx !== 0 || dy !== 0) && stamina > 5;
    let currentSpeed = player.baseSpeed;

    if (coffeeBoostTime > 0) {
      currentSpeed += 1.4; // Boost kawowy
    }

    if (isSprinting) {
      currentSpeed = player.sprintSpeed;
      if (coffeeBoostTime > 0) currentSpeed += 1.0;
      stamina -= 32 * dt;
      if (stamina < 0) stamina = 0;

      // Cząsteczki sprintu
      if (Math.random() < 0.3) {
        particles.push({
          x: player.x,
          y: player.y + 10,
          vx: -dx * 1.5 + (Math.random() - 0.5),
          vy: -dy * 1.5 + (Math.random() - 0.5),
          color: coffeeBoostTime > 0 ? '#f5a623' : '#38bdf8',
          size: 3,
          life: 0.6,
          decay: 0.04,
        });
      }
    } else {
      // Regeneracja staminy (szybsza gdy pije kawę lub stoi)
      const regenRate = (coffeeBoostTime > 0 ? 30 : 15) * (dx === 0 && dy === 0 ? 1.5 : 1);
      stamina += regenRate * dt;
      if (stamina > maxStamina) stamina = maxStamina;
    }

    // Aplikacja ruchu z kolizją
    const targetX = player.x + dx * currentSpeed;
    const targetY = player.y + dy * currentSpeed;

    if (canMoveTo(targetX, player.y, player.size / 2)) {
      player.x = targetX;
    }
    if (canMoveTo(player.x, targetY, player.size / 2)) {
      player.y = targetY;
    }

    // Kierunek spojrzenia gracza
    if (Math.abs(dx) > Math.abs(dy)) {
      player.facing = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      player.facing = dy > 0 ? 'down' : 'up';
    }

    if (dx !== 0 || dy !== 0) {
      player.walkCycle += dt * 8;
    }

    // --- Ruch Egzaminatora (AI Ścigania) ---
    // Jeśli freezeTimer > 0, egzaminator NIE rusza się wcale (czyta gazetę lub paraliż AI)!
    if (freezeTimer > 0) {
      examiner.currentSpeed = 0;
    } else {
      examiner.currentSpeed = examiner.baseSpeed + (ects / TARGET_ECTS) * 0.95;

      const toPlayerX = player.x - examiner.x;
      const toPlayerY = player.y - examiner.y;
      const distToPlayer = Math.hypot(toPlayerX, toPlayerY);

      if (distToPlayer > 0) {
        let exDirX = toPlayerX / distToPlayer;
        let exDirY = toPlayerY / distToPlayer;

        // Sprawdź czy może iść wprost, jeśli nie - próba obejścia przeszkód
        const exStepX = examiner.x + exDirX * examiner.currentSpeed;
        const exStepY = examiner.y + exDirY * examiner.currentSpeed;

        let moved = false;
        if (canMoveTo(exStepX, examiner.y, examiner.size / 2)) {
          examiner.x = exStepX;
          moved = true;
        }
        if (canMoveTo(examiner.x, exStepY, examiner.size / 2)) {
          examiner.y = exStepY;
          moved = true;
        }

        // Proste ominięcie narożnika jeśli utknął
        if (!moved) {
          if (canMoveTo(examiner.x + examiner.currentSpeed, examiner.y, examiner.size / 2)) {
            examiner.x += examiner.currentSpeed;
          } else if (canMoveTo(examiner.x - examiner.currentSpeed, examiner.y, examiner.size / 2)) {
            examiner.x -= examiner.currentSpeed;
          } else if (canMoveTo(examiner.x, examiner.y + examiner.currentSpeed, examiner.size / 2)) {
            examiner.y += examiner.currentSpeed;
          } else {
            examiner.y -= examiner.currentSpeed;
          }
        }

        examiner.facing = exDirX > 0 ? 'right' : 'left';
        examiner.walkCycle += dt * 6;
      }
    }

    // Kolizja: Egzaminator łapie studenta LUB student bezkarnie ściąga!
    const distToExaminer = Math.hypot(player.x - examiner.x, player.y - examiner.y);
    if (distToExaminer < (player.size + examiner.size) / 2) {
      if (freezeTimer > 0) {
        // Egzaminator nie patrzy ("nie patrzy czy Studenci ściągają")!
        if (isUltraRetro) {
          const nowSec = Date.now() / 1000;
          if (nowSec - lastCheatTime > 1.0) {
            lastCheatTime = nowSec;
            if (window.soundSystem) window.soundSystem.play('cheat');
            if (ects < TARGET_ECTS) {
              ects += 1;
            }
            stamina = Math.min(maxStamina, stamina + 30);
            floatingTexts.push({
              x: player.x,
              y: player.y - 18,
              text: 'ŚCIĄGA! +1 ECTS 📝🤫',
              color: '#fef08a',
              life: 1.4,
            });
            for (let p = 0; p < 8; p++) {
              particles.push({
                x: player.x,
                y: player.y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 3,
                color: '#ffffff',
                size: 2.5,
                life: 0.6,
                decay: 0.04,
              });
            }
            if (Math.random() < 0.7) {
              const rx = CHEAT_REACTIONS[Math.floor(Math.random() * CHEAT_REACTIONS.length)];
              showProfQuote(rx, 'none');
            }
            if (ects >= TARGET_ECTS) {
              triggerVictory();
              return;
            }
          }
        }
      } else {
        triggerGameOver();
        return;
      }
    }

    // --- Zbieranie przedmiotów ---
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const d = Math.hypot(player.x - item.x, player.y - item.y);
      if (d < player.size / 2 + item.size / 2) {
        if (item.type === 'ects') {
          ects += 1;
          if (window.soundSystem) window.soundSystem.play('ects');
          // Cząsteczki zebrania
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#f59e0b',
              size: 3,
              life: 0.5,
              decay: 0.05,
            });
          }
          items.splice(i, 1);
          // Odradzanie nowego indeksu w innym miejscu
          if (ects < TARGET_ECTS) spawnItem('ects');
        } else if (item.type === 'coffee') {
          coffeesDrunk += 1;
          coffeeBoostTime = 6; // 6 sekund boostu
          stamina = maxStamina;
          if (window.soundSystem) window.soundSystem.play('coffee');
          items.splice(i, 1);
          spawnItem('coffee');
          showProfQuote('„Czy to kawa z bufetu ALK?! I tak Pana dogonię!”');
        } else if (item.type === 'lion') {
          ects = Math.min(TARGET_ECTS, ects + 3);
          if (window.soundSystem) window.soundSystem.play('shield');
          items.splice(i, 1);
          showProfQuote('„Złoty Lew Koźmińskiego?! Dobre osiągnięcie, ale wciąż sprawdzam indeks!”');
          setTimeout(() => spawnItem('lion'), 20000);
        } else if (item.type === 'freeze') {
          if (isUltraRetro) {
            freezeTimer = 7.0;
            if (window.soundSystem) window.soundSystem.play('newspaper');
            const q = NEWSPAPER_QUOTES[Math.floor(Math.random() * NEWSPAPER_QUOTES.length)];
            showProfQuote(q, 'newspaper');
            floatingTexts.push({
              x: item.x,
              y: item.y - 15,
              text: '📰 ŚWIEŻA GAZETA! PROFESOR CZYTA!',
              color: '#fbbf24',
              life: 1.6,
            });
            for (let p = 0; p < 12; p++) {
              particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: ['#f8fafc', '#cbd5e1', '#f59e0b', '#fde047'][Math.floor(Math.random() * 4)],
                size: 3,
                life: 0.8,
                decay: 0.03,
              });
            }
          } else {
            freezeTimer = 6.0;
            if (window.soundSystem) window.soundSystem.play('freeze');
            const q = GEMINI_QUOTES[Math.floor(Math.random() * GEMINI_QUOTES.length)];
            showProfQuote(q, 'freeze');
            floatingTexts.push({
              x: item.x,
              y: item.y - 15,
              text: '✨ GEMINI AI: PARALIŻ PROFESORA!',
              color: '#38bdf8',
              life: 1.6,
            });
            for (let p = 0; p < 12; p++) {
              particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: ['#38bdf8', '#a855f7', '#60a5fa', '#fbcfe8'][Math.floor(Math.random() * 4)],
                size: 3,
                life: 0.8,
                decay: 0.03,
              });
            }
          }
          items.splice(i, 1);
          setTimeout(() => spawnItem('freeze'), 18000);
        }

        // Warunek wygranej
        if (ects >= TARGET_ECTS) {
          triggerVictory();
          return;
        }
      }
    }

    // Cząsteczki
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    updateHUD();
  }

  // --- Rysowanie planszy ALK ---
  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Tło korytarzy uczelni (kafelki)
    ctx.fillStyle = '#0a2238';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Siatka korytarza
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 2. Zielone Patio w centrum
    ctx.fillStyle = '#1e4620';
    ctx.fillRect(PATIO_AREA.x, PATIO_AREA.y, PATIO_AREA.w, PATIO_AREA.h);

    // Ścieżki na patio
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(PATIO_AREA.x + PATIO_AREA.w / 2 - 20, PATIO_AREA.y, 40, PATIO_AREA.h);
    ctx.fillRect(PATIO_AREA.x, PATIO_AREA.y + PATIO_AREA.h / 2 - 20, PATIO_AREA.w, 40);

    // Trawa na patio - subtelny wzór
    ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
    for (let i = 0; i < 24; i++) {
      const px = PATIO_AREA.x + 15 + ((i * 47) % (PATIO_AREA.w - 30));
      const py = PATIO_AREA.y + 15 + ((i * 31) % (PATIO_AREA.h - 30));
      ctx.fillRect(px, py, 6, 6);
    }

    // Cokół i rzeźba Lwa ALK w środku patio
    ctx.fillStyle = '#334155';
    ctx.fillRect(380, 250, 40, 40);
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 2;
    ctx.strokeRect(380, 250, 40, 40);

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦁', 400, 270);

    // Podpisy sektorów kampusu
    ctx.font = '10px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(245, 166, 35, 0.45)';
    ctx.fillText('SEKTOR A &bull; AULA GŁÓWNA', 90, 35);
    ctx.fillText('SEKTOR B &bull; BIBLIOTEKA ALK', 710, 35);
    ctx.fillText('SEKTOR C &bull; BUFET & DZIEKANAT', 100, 515);
    ctx.fillText('SEKTOR D &bull; KOLEGIUM ZARZĄDZANIA', 710, 515);
    ctx.fillText('ZIELONE PATIO ALK', 400, 160);

    // 3. Ściany i kolumny
    for (const wall of WALLS) {
      if (wall.x === 380 && wall.y === 250) continue; // pomnik narysowany osobno

      ctx.fillStyle = '#061626';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

      ctx.strokeStyle = 'rgba(245, 166, 35, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Akcenty narożników
      ctx.fillStyle = '#0d4470';
      ctx.fillRect(wall.x + 2, wall.y + 2, wall.w - 4, wall.h - 4);
    }

    // 4. Przedmioty na planszy (Indeksy ECTS, Kawa, Złoty Lew)
    const timeSec = Date.now() / 1000;
    for (const item of items) {
      const bob = Math.sin(timeSec * 4 + item.bobOffset) * 3;
      const iy = item.y + bob;

      if (item.type === 'ects') {
        // Książka / Indeks ECTS
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(item.x - 9, iy - 11, 18, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(item.x - 7, iy - 9, 14, 4);

        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📘', item.x, iy);

        // Subtelna poświata
        ctx.strokeStyle = 'rgba(245, 166, 35, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(item.x - 10, iy - 12, 20, 24);
      } else if (item.type === 'coffee') {
        // Espresso z bufetu
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☕', item.x, iy);

        // Para nad kawą
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(item.x, iy - 14, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'lion') {
        // Złoty Lew ALK (+3 ECTS)
        ctx.fillStyle = 'rgba(245, 166, 35, 0.25)';
        ctx.beginPath();
        ctx.arc(item.x, iy, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', item.x, iy);
      } else if (item.type === 'freeze') {
        if (isUltraRetro) {
          // Gazeta Codzienna (Ultra-Retro)
          ctx.save();
          ctx.translate(item.x, iy);

          // Poświata retro
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();

          // Płachta złożonej gazety
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-11, -8, 22, 16);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.strokeRect(-11, -8, 22, 16);

          // Zagięcie pionowe
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-0.5, -8, 1, 16);

          // Winieta tytułowa prasy
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-10, -7, 20, 3.5);

          // Kolumny tekstu
          ctx.fillStyle = '#475569';
          ctx.fillRect(-9, -2, 7, 1.2);
          ctx.fillRect(-9, 1, 6, 1.2);
          ctx.fillRect(-9, 4, 7, 1.2);
          ctx.fillRect(2, -2, 7, 1.2);
          ctx.fillRect(2, 1, 6, 1.2);
          ctx.fillRect(2, 4, 7, 1.2);

          // Ikonka gazety
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📰', 0, -12);

          ctx.restore();
        } else {
          // Gemini AI (Tryb Nowoczesny)
          ctx.save();
          ctx.translate(item.x, iy);

          const pulse = Math.sin(timeSec * 5) * 2;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, 15 + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Diamentowy chip Gemini
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(10, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-10, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✨', 0, 0);

          ctx.restore();
        }
      }
    }

    // 5. Cząsteczki
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 6. Rysowanie Gracza (Student)
    drawStudent(player.x, player.y, player.facing, player.walkCycle, isSprinting, coffeeBoostTime > 0);

    // 7. Rysowanie Egzaminatora (Profesor z czerwonym długopisem)
    drawExaminer(examiner.x, examiner.y, examiner.facing, examiner.walkCycle);

    // 8. Pływające teksty (bonusy ze ściągania, power-upy)
    for (const ft of floatingTexts) {
      ctx.save();
      ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = Math.min(1, ft.life);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- Wizualizacja Gracza (Student w bluzie ALK z plecakiem) ---
  function drawStudent(x, y, facing, cycle, sprinting, buffed) {
    ctx.save();
    ctx.translate(x, y);

    // Poświata sprintu lub kawy
    if (buffed) {
      ctx.fillStyle = 'rgba(245, 166, 35, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (sprinting) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cień
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ciało (Granatowa bluza ALK)
    ctx.fillStyle = '#002b49';
    ctx.fillRect(-8, -4, 16, 16);

    // Logo ALK na plecach/klatce
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(-3, 0, 6, 4);

    // Plecak
    ctx.fillStyle = '#475569';
    if (facing === 'down') ctx.fillRect(-6, -2, 12, 6);
    else if (facing === 'up') ctx.fillRect(-7, -4, 14, 10);
    else if (facing === 'left') ctx.fillRect(2, -3, 6, 12);
    else ctx.fillRect(-8, -3, 6, 12);

    // Głowa
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -9, 8, 0, Math.PI * 2);
    ctx.fill();

    // Czapka studencka / biret
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, -15, 18, 5);
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(4, -13, 2, 8); // chwościk biretu

    // Nóżki / Animacja kroków
    const legOffset = Math.sin(cycle) * 4;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-6, 11, 4, 6 + (facing === 'left' || facing === 'right' ? legOffset : 0));
    ctx.fillRect(2, 11, 4, 6 - (facing === 'left' || facing === 'right' ? legOffset : 0));

    ctx.restore();
  }

  // --- Wizualizacja Egzaminatora (Garnitur, okulary, czerwony długopis LUB czytanie gazety) ---
  function drawExaminer(x, y, facing, cycle) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Kiedy Egzaminator czyta gazetę w Trybie Ultra-Retro! ("nie patrzy czy Studenci ściągają")
    if (freezeTimer > 0 && isUltraRetro) {
      // Spokojna, ciepła aura zaczytanego profesora
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Cień
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nóżki stojące spokojnie w miejscu
      ctx.fillStyle = '#111827';
      ctx.fillRect(-7, 12, 4, 6);
      ctx.fillRect(3, 12, 4, 6);

      // Ciało: elegancki ciemnoszary garnitur profesora
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-9, -4, 18, 17);

      // Głowa lekko widoczna zza gazety
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -10, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Siwe profesorskie włosy
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -13, 9, Math.PI, Math.PI * 2);
      ctx.fill();

      // Okulary zsunięte na nos (spojrzenie wbite w tekst gazety)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -10, 4, 3);
      ctx.strokeRect(1, -10, 4, 3);

      // DUŻA ROZŁOŻONA RETRO GAZETA W DŁONIACH (Zasłania całą twarz i pole widzenia!)
      const paperSway = Math.sin(Date.now() / 350) * 1;
      const paperY = -5 + paperSway;

      // Płachta gazety (wielkoformatowa broadsheet '96)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-18, paperY, 36, 24);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, paperY, 36, 24);

      // Zgięcie pionowe na pół
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, paperY);
      ctx.lineTo(0, paperY + 24);
      ctx.stroke();

      // Czarna winieta tytułowa prasy
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, paperY + 2, 32, 4.5);

      // Tytuł gazety
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 3.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RZECZPOSPOLITA', 0, paperY + 5.5);

      // Kolumny tekstu (poziome kreseczki prasy)
      ctx.fillStyle = '#334155';
      for (let row = 0; row < 4; row++) {
        ctx.fillRect(-15, paperY + 8 + row * 3.2, 12, 1.2);
        ctx.fillRect(3, paperY + 8 + row * 3.2, 12, 1.2);
      }

      // Kwadracik krzyżówki / notowań w rogu
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(9, paperY + 15, 6, 6);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(9, paperY + 15, 6, 6);

      // Dłonie trzymające gazetę po bokach
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-20, paperY + 8, 3, 8);
      ctx.fillRect(17, paperY + 8, 3, 8);

      // Mankiety garnituru
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-21, paperY + 7, 2, 10);
      ctx.fillRect(19, paperY + 7, 2, 10);

      // Czerwony długopis wetknięty bezpiecznie w kieszonkę
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-8, paperY + 3, 2, 4);

      // Ikonka czytania prasy nad głową profesora
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📰', 0, -22);

      ctx.restore();
      return;
    }

    // 2. Kiedy Egzaminator jest sparaliżowany przez Gemini AI (Tryb Nowoczesny)
    if (freezeTimer > 0 && !isUltraRetro) {
      // Cyjanowa cybernetyczna aura paraliżu
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Cień
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sylwetka garnituru
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-9, -4, 18, 17);

      // Krawat
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-2, -3, 4, 11);

      // Głowa i siwe włosy
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -10, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -13, 9, Math.PI, Math.PI * 2);
      ctx.fill();

      // Okulary
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -12, 4, 3);
      ctx.strokeRect(1, -12, 4, 3);

      // Nóżki stoją w miejscu
      ctx.fillStyle = '#111827';
      ctx.fillRect(-7, 12, 4, 6);
      ctx.fillRect(3, 12, 4, 6);

      // Długopis w dłoni
      const penX = facing === 'left' ? -15 : 12;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(penX, -4);
      ctx.lineTo(penX + 4, 8);
      ctx.stroke();

      // Krążące gwiazdki Gemini wokół głowy
      const spin = (Date.now() / 250) % (Math.PI * 2);
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', Math.cos(spin) * 14, -20 + Math.sin(spin) * 5);
      ctx.fillText('💫', Math.cos(spin + Math.PI) * 14, -20 + Math.sin(spin + Math.PI) * 5);

      ctx.restore();
      return;
    }

    // 3. Normalny stan: Egzaminator ściga studenta z czerwonym długopisem!
    // Czerwona groźna aura egzaminatora
    ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // Cień
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sylwetka: elegancki ciemnoszary garnitur profesora
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-9, -4, 18, 17);

    // Krawat
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, -3, 4, 11);

    // Głowa i siwe włosy
    ctx.fillStyle = '#fde047'; // karnacja
    ctx.beginPath();
    ctx.arc(0, -10, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Siwe profesorskie włosy
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, -13, 9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Okulary profesorskie
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-5, -12, 4, 3);
    ctx.strokeRect(1, -12, 4, 3);

    // Nóżki
    const legOffset = Math.sin(cycle) * 3;
    ctx.fillStyle = '#111827';
    ctx.fillRect(-7, 12, 4, 6 + legOffset);
    ctx.fillRect(3, 12, 4, 6 - legOffset);

    // SŁYNNY CZERWONY DŁUGOPIS W DŁONI PROFESORA
    const penPulse = Math.sin(Date.now() / 150) * 2;
    const penX = facing === 'left' ? -15 : 12;
    const penY = 0;

    // Poświata czerwonego wkładu
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.arc(penX + 2, penY + penPulse, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rysik długopisu
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(penX, penY - 4 + penPulse);
    ctx.lineTo(penX + 4, penY + 8 + penPulse);
    ctx.stroke();

    ctx.restore();
  }

  // --- Główna pętla gry ---
  let lastFrameTime = performance.now();
  function gameLoop(currentTime) {
    const dt = Math.min(0.1, (currentTime - lastFrameTime) / 1000);
    lastFrameTime = currentTime;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // --- Obsługa sterowania klawiaturą ---
  window.addEventListener('keydown', (e) => {
    // Spacja lub Shift do sprintu
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      keys.sprint = true;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      keys.up = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      keys.down = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = true;
      e.preventDefault();
    }
    if (e.key === 'r' || e.key === 'R') {
      setUltraRetroMode(!isUltraRetro);
      if (window.soundSystem) {
        window.soundSystem.play(isUltraRetro ? 'newspaper' : 'freeze');
      }
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      togglePause();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      keys.sprint = false;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  // --- Obsługa wirtualnego sterowania dotykowego (D-Pad & Sprint) ---
  function bindTouchButton(btn, keyProp) {
    if (!btn) return;
    const startHandler = (e) => {
      e.preventDefault();
      keys[keyProp] = true;
      btn.classList.add('active');
    };
    const endHandler = (e) => {
      e.preventDefault();
      keys[keyProp] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('pointerdown', startHandler);
    btn.addEventListener('pointerup', endHandler);
    btn.addEventListener('pointercancel', endHandler);
    btn.addEventListener('pointerleave', endHandler);
  }

  bindTouchButton(dpadUp, 'up');
  bindTouchButton(dpadDown, 'down');
  bindTouchButton(dpadLeft, 'left');
  bindTouchButton(dpadRight, 'right');
  bindTouchButton(touchSprint, 'sprint');

  // --- Dźwięk i Pauza ---
  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      if (pauseIcon) pauseIcon.textContent = '▶️';
      if (statusText) statusText.textContent = 'Pauza. Naciśnij P lub ikonę, by wznowić.';
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      if (pauseIcon) pauseIcon.textContent = '⏸️';
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const audio = window.soundSystem || window.gameAudio;
      if (audio) {
        const isMuted = audio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  if (pauseToggleBtn) {
    pauseToggleBtn.addEventListener('click', togglePause);
  }

  if (retroToggleBtn) {
    retroToggleBtn.addEventListener('click', () => {
      setUltraRetroMode(!isUltraRetro);
      if (window.soundSystem) {
        window.soundSystem.play(isUltraRetro ? 'newspaper' : 'freeze');
      }
    });
  }

  if (retroModeCheckbox) {
    retroModeCheckbox.addEventListener('change', (e) => {
      setUltraRetroMode(e.target.checked);
      if (window.soundSystem) {
        window.soundSystem.play(isUltraRetro ? 'newspaper' : 'freeze');
      }
    });
  }

  // --- Podpięcie przycisków w oknach modalnych ---
  if (startGameBtn) startGameBtn.addEventListener('click', startGame);
  if (restartGameBtn) restartGameBtn.addEventListener('click', startGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', startGame);

  // Pierwsza inicjalizacja
  setUltraRetroMode(isUltraRetro);
  initItems();
  updateHUD();
  requestAnimationFrame(gameLoop);
})();
