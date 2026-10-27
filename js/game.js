/**
 * Kozminski Escape: Polowanie na ECTS
 * Serce gry: Silnik Canvas 2D (800x540)
 * Akademia Leona Koźmińskiego (ALK)
 */

(() => {
  // --- Konfiguracja i Stałe Canvas ---
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 540;
  const TARGET_ECTS = 30;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // --- Elementy HUD ---
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

  // Dymek profesora
  const profSpeech = document.getElementById('profSpeech');
  const profDialogText = document.getElementById('profDialogText');

  // Ekrany modalne
  const startModal = document.getElementById('startModal');
  const startGameBtn = document.getElementById('startGameBtn');
  const gameOverModal = document.getElementById('gameOverModal');
  const restartGameBtn = document.getElementById('restartGameBtn');
  const victoryModal = document.getElementById('victoryModal');
  const playAgainBtn = document.getElementById('playAgainBtn');

  // Statystyki modalne
  const failEctsCollected = document.getElementById('failEctsCollected');
  const failSurvivalTime = document.getElementById('failSurvivalTime');
  const failCoffeesDrunk = document.getElementById('failCoffeesDrunk');
  const failQuote = document.getElementById('failQuote');

  const victoryEcts = document.getElementById('victoryEcts');
  const victoryTime = document.getElementById('victoryTime');
  const victoryRating = document.getElementById('victoryRating');

  // Przyciski dotykowe (D-pad i sprint)
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');
  const touchSprint = document.getElementById('touchSprint');

  // --- Cytaty Egzaminatora (zgodne ze specyfikacją) ---
  const PROF_QUOTES = [
    '„A gdzie przypis harwardzki?!”',
    '„Ten bilans się nie zamyka!”',
    '„Widzę Pana we wrześniu!”',
    '„USOS właśnie zamknął protokół!”',
    '„Czy ten esej pisał Pan, czy ChatGPT?!”',
    '„Proszę podejść z indeksem i kartą zaliczeń!”',
    '„Termin zerówki bezpowrotnie minął!”',
    '„Czerwony długopis już nie wybacza!”',
  ];

  // --- 1. Układ Kampusu na Canvasie ---
  // Granice auli, sal i centralnego Patio ALK
  const WALLS = [
    // Zewnętrzne mury uczelni (obwód)
    { x: 0, y: 0, w: CANVAS_WIDTH, h: 22, name: 'Mur Północny' },
    { x: 0, y: CANVAS_HEIGHT - 22, w: CANVAS_WIDTH, h: 22, name: 'Mur Południowy' },
    { x: 0, y: 0, w: 22, h: CANVAS_HEIGHT, name: 'Mur Zachodni' },
    { x: CANVAS_WIDTH - 22, y: 0, w: 22, h: CANVAS_HEIGHT, name: 'Mur Wschodni' },

    // Aula A (Lewy górny róg kampusu)
    { x: 130, y: 22, w: 16, h: 135 },
    { x: 22, y: 157, w: 124, h: 16 },

    // Biblioteka (Prawy górny róg kampusu)
    { x: 654, y: 22, w: 16, h: 135 },
    { x: 654, y: 157, w: 124, h: 16 },

    // Dziekanat (Lewy dolny róg kampusu)
    { x: 22, y: 375, w: 124, h: 16 },
    { x: 130, y: 375, w: 16, h: 143 },

    // Lab Komputerowy (Prawy dolny róg kampusu)
    { x: 654, y: 375, w: 124, h: 16 },
    { x: 654, y: 375, w: 16, h: 143 },

    // Kolumny i murki korytarzowe
    { x: 245, y: 165, w: 22, h: 22 },
    { x: 533, y: 165, w: 22, h: 22 },
    { x: 245, y: 353, w: 22, h: 22 },
    { x: 533, y: 353, w: 22, h: 22 },

    // Cokół pomnika Lwa w centrum Patio ALK
    { x: 382, y: 252, w: 36, h: 36, isMonument: true },
  ];

  // Obszar Patio ALK 🌿
  const PATIO = {
    x: 225,
    y: 135,
    w: 350,
    h: 270,
  };

  // Strefy sal z etykietami na mapie
  const ROOMS = [
    { name: 'Aula A', x: 76, y: 90, color: '#f2a900' },
    { name: 'Biblioteka', x: 724, y: 90, color: '#ffc740' },
    { name: 'Dziekanat', x: 76, y: 450, color: '#f2a900' },
    { name: 'Lab Komputerowy', x: 724, y: 450, color: '#ffc740' },
  ];

  // --- Stan gry ---
  let gameState = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'
  let ects = 0;
  let stamina = 100;
  const maxStamina = 100;
  let isSprinting = false;

  // Efekty czasowe
  let coffeeTurboTime = 0;      // 5 sekund przyspieszenia po kawie
  let freezeTimer = 0;          // 3.5 sekundy zamrożenia profesora przez Gemini AI
  let hasShield = false;        // Legitymacja ALK chroni przed 1 złapaniem
  let coffeesDrunk = 0;
  let geminiUsed = 0;
  let gameStartTime = 0;
  let elapsedTime = 0;
  let quoteTimer = 0;
  let speechBubbleTimeout = null;
  let particles = [];

  // Sterowanie
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
  };

  // --- 2. Gracz (Student) ---
  const player = {
    x: 76,
    y: 90,
    radius: 12,
    baseSpeed: 3.2,
    sprintSpeed: 5.4,
    facing: 'down',
    walkCycle: 0,
    shieldGlow: 0,
  };

  // --- 3. Przeciwnik (Egzaminator) ---
  const examiner = {
    x: 724,
    y: 450,
    radius: 13,
    baseSpeed: 2.15,
    currentSpeed: 2.15,
    facing: 'left',
    walkCycle: 0,
    freezePulse: 0,
  };

  // --- 4. Przedmioty na Kampusie ---
  // Typy: 'ects' (📜), 'coffee' (☕), 'gemini' (💻), 'card' (🪪)
  let items = [];

  // Pomocnik audio z bezpośrednim wywołaniem SoundSystem.play(...) zgodnie ze specyfikacją
  function playSound(type) {
    if (typeof SoundSystem !== 'undefined' && typeof SoundSystem.play === 'function') {
      SoundSystem.play(type);
    } else if (window.soundSystem && typeof window.soundSystem.play === 'function') {
      window.soundSystem.play(type);
    }
  }

  // --- Sprawdzanie kolizji ---
  function checkCircleBoxCollision(cx, cy, radius, box) {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
    const distX = cx - closestX;
    const distY = cy - closestY;
    return (distX * distX + distY * distY) < (radius * radius);
  }

  function canMoveTo(x, y, radius) {
    for (const wall of WALLS) {
      if (checkCircleBoxCollision(x, y, radius, wall)) {
        return false;
      }
    }
    return true;
  }

  // --- Bezpieczny spawn przedmiotów poza ścianami ---
  function spawnItem(type) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      let x, y;

      if (type === 'coffee') {
        // Kawa najczęściej pojawia się w okolicach Patio ALK lub korytarzy
        x = PATIO.x + 30 + Math.random() * (PATIO.w - 60);
        y = PATIO.y + 30 + Math.random() * (PATIO.h - 60);
      } else if (type === 'gemini') {
        // Gemini AI często w Labie Komputerowym lub salach
        x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        y = 40 + Math.random() * (CANVAS_HEIGHT - 80);
      } else {
        // ECTS oraz Legitymacja ALK
        x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        y = 40 + Math.random() * (CANVAS_HEIGHT - 80);
      }

      // Sprawdź czy nie koliduje z żadną ścianą
      let insideWall = false;
      for (const wall of WALLS) {
        if (checkCircleBoxCollision(x, y, 16, wall)) {
          insideWall = true;
          break;
        }
      }

      // Nie twórz zbyt blisko studenta
      const distToStudent = Math.hypot(x - player.x, y - player.y);

      if (!insideWall && distToStudent > 75) {
        items.push({
          x,
          y,
          type,
          radius: 12,
          bobOffset: Math.random() * Math.PI * 2,
        });
        placed = true;
      }
    }
  }

  function initCampusItems() {
    items = [];
    // 7x ECTS (📜)
    for (let i = 0; i < 7; i++) {
      spawnItem('ects');
    }
    // 2x Kawa z Patio ALK (☕)
    for (let i = 0; i < 2; i++) {
      spawnItem('coffee');
    }
    // 1x Gemini AI (💻)
    spawnItem('gemini');
    // 1x Legitymacja ALK (🪪)
    spawnItem('card');
  }

  // --- Dymek wypowiedzi profesora ---
  function triggerProfQuote(customText = null) {
    if (!profSpeech || !profDialogText) return;
    const text = customText || PROF_QUOTES[Math.floor(Math.random() * PROF_QUOTES.length)];
    profDialogText.textContent = text;
    profSpeech.classList.remove('bubble-hidden');

    if (speechBubbleTimeout) clearTimeout(speechBubbleTimeout);
    speechBubbleTimeout = setTimeout(() => {
      profSpeech.classList.add('bubble-hidden');
    }, 3600);
  }

  // --- Resetowanie gry ---
  function resetGame() {
    ects = 0;
    stamina = 100;
    coffeeTurboTime = 0;
    freezeTimer = 0;
    hasShield = false;
    coffeesDrunk = 0;
    geminiUsed = 0;
    gameStartTime = Date.now();
    elapsedTime = 0;
    quoteTimer = 0;
    particles = [];

    // Reset pozycji studenta (Aula A)
    player.x = 76;
    player.y = 90;
    player.facing = 'down';

    // Reset pozycji profesora (Lab Komputerowy)
    examiner.x = 724;
    examiner.y = 450;
    examiner.facing = 'left';
    examiner.currentSpeed = examiner.baseSpeed;

    initCampusItems();
    updateHUD();

    if (profSpeech) profSpeech.classList.add('bubble-hidden');
  }

  // --- Rozpoczęcie semestru (Start) ---
  function startGame() {
    if (typeof SoundSystem !== 'undefined' && typeof SoundSystem.init === 'function') {
      SoundSystem.init();
    } else if (window.soundSystem) {
      window.soundSystem.init();
    }
    playSound('ects');

    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    victoryModal.classList.add('hidden');

    resetGame();
    gameState = 'PLAYING';
    triggerProfQuote('„Sesja rozpoczęta! Czerwony długopis jest w pogotowiu!”');
  }

  // --- Koniec Gry: Kampania Wrześniowa (Porażka) ---
  function triggerGameOver() {
    gameState = 'GAMEOVER';
    playSound('hit');

    failEctsCollected.textContent = `${ects} / ${TARGET_ECTS}`;
    failSurvivalTime.textContent = formatTime(elapsedTime);
    failCoffeesDrunk.textContent = coffeesDrunk;
    failQuote.textContent = '„Niestety, dopadł Cię czerwony długopis! Widzimy się na poprawce we wrześniu!”';

    gameOverModal.classList.remove('hidden');
  }

  // --- Wygrana: Zaliczony Semestr (30 ECTS) ---
  function triggerVictory() {
    gameState = 'VICTORY';
    playSound('win');

    victoryEcts.textContent = `${ects} / ${TARGET_ECTS}`;
    victoryTime.textContent = formatTime(elapsedTime);

    let rating = 'DOBRY (4.0)';
    if (elapsedTime <= 65) rating = 'CELUJĄCY Z WYRÓŻNIENIEM (5.5) 🏆';
    else if (elapsedTime <= 95) rating = 'BARDZO DOBRY (5.0) ⭐';
    else if (elapsedTime <= 135) rating = 'PONADPRZECIĘTNY (4.5)';
    victoryRating.textContent = rating;

    // Cząsteczki triumfalnego konfetti
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        color: ['#f2a900', '#ffc740', '#004b87', '#22c55e', '#ef4444'][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 5,
        life: 1,
        decay: 0.009 + Math.random() * 0.01,
      });
    }

    victoryModal.classList.remove('hidden');
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Aktualizacja paska stanu (HUD) ---
  function updateHUD() {
    // ECTS
    ectsCounter.textContent = `${ects} / ${TARGET_ECTS}`;
    const pct = Math.min(100, (ects / TARGET_ECTS) * 100);
    ectsProgressBar.style.width = `${pct}%`;

    // Stamina
    staminaProgressBar.style.width = `${stamina}%`;
    staminaPercent.textContent = `${Math.round(stamina)}%`;

    // Zegar
    timerDisplay.textContent = formatTime(elapsedTime);

    // Dynamiczny status sesji
    const dist = Math.hypot(player.x - examiner.x, player.y - examiner.y);

    if (freezeTimer > 0) {
      statusMessage.className = 'hud-status-badge';
      statusMessage.style.borderColor = '#38bdf8';
      statusText.innerHTML = `❄️ Gemini AI: Profesor zamrożony (${freezeTimer.toFixed(1)}s)`;
    } else if (hasShield) {
      statusMessage.className = 'hud-status-badge';
      statusMessage.style.borderColor = '#f2a900';
      statusText.innerHTML = '🪪 Legitymacja ALK: Tarcza aktywna!';
    } else if (coffeeTurboTime > 0) {
      statusMessage.className = 'hud-status-badge';
      statusMessage.style.borderColor = '#f2a900';
      statusText.innerHTML = `☕ Turbo Kawa z Patio! (${coffeeTurboTime.toFixed(1)}s)`;
    } else if (dist < 170) {
      statusMessage.className = 'hud-status-badge status-alert';
      statusMessage.style.borderColor = '';
      statusText.textContent = 'UWAGA! Egzaminator tuż za Tobą!';
    } else {
      statusMessage.className = 'hud-status-badge status-safe';
      statusMessage.style.borderColor = '';
      statusText.textContent = 'Szukaj ECTS w aulach i na Patio!';
    }
  }

  // --- Główna logika gry (Update) ---
  function update(dt) {
    if (gameState !== 'PLAYING') return;

    elapsedTime = (Date.now() - gameStartTime) / 1000;

    // Odliczanie czasu efektów
    if (coffeeTurboTime > 0) {
      coffeeTurboTime -= dt;
      if (coffeeTurboTime < 0) coffeeTurboTime = 0;
    }

    if (freezeTimer > 0) {
      freezeTimer -= dt;
      if (freezeTimer < 0) freezeTimer = 0;
    }

    // Dynamiczne wypowiedzi akademickie profesora co 9-12 sekund
    quoteTimer += dt;
    if (quoteTimer > 10.5 && freezeTimer <= 0) {
      quoteTimer = 0;
      triggerProfQuote();
    }

    // --- 2. Ruch wektorowy studenta ---
    let vx = 0;
    let vy = 0;

    if (input.up) vy -= 1;
    if (input.down) vy += 1;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;

    // Normalizacja wektora (zapobiega szybszemu chodzeniu po przekątnych)
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const isMoving = vx !== 0 || vy !== 0;

    // Mechanika staminy i sprintu
    isSprinting = input.sprint && isMoving && stamina > 6;
    let currentSpeed = player.baseSpeed;

    if (coffeeTurboTime > 0) {
      currentSpeed += 1.8; // Turbo po kawie z Patio
    }

    if (isSprinting) {
      currentSpeed = player.sprintSpeed + (coffeeTurboTime > 0 ? 1.4 : 0);
      stamina -= 34 * dt;
      if (stamina < 0) stamina = 0;

      // Cząsteczki sprintu
      if (Math.random() < 0.35) {
        particles.push({
          x: player.x,
          y: player.y + 8,
          vx: -vx * 1.6 + (Math.random() - 0.5),
          vy: -vy * 1.6 + (Math.random() - 0.5),
          color: coffeeTurboTime > 0 ? '#ffc740' : '#00a3ff',
          size: 3,
          life: 0.5,
          decay: 0.05,
        });
      }
    } else {
      // Regeneracja staminy: postój odnawia znacznie szybciej niż wolny chód
      const regenRate = (!isMoving ? 26 : 14) * (coffeeTurboTime > 0 ? 2 : 1);
      stamina = Math.min(maxStamina, stamina + regenRate * dt);
    }

    // Wyliczanie nowej pozycji gracza z kolizją ze ścianami (sliding po ścianach)
    const nextX = player.x + vx * currentSpeed;
    const nextY = player.y + vy * currentSpeed;

    if (canMoveTo(nextX, player.y, player.radius)) {
      player.x = nextX;
    }
    if (canMoveTo(player.x, nextY, player.radius)) {
      player.y = nextY;
    }

    // Aktualizacja kierunku i animacji chodu
    if (Math.abs(vx) > Math.abs(vy)) {
      player.facing = vx > 0 ? 'right' : 'left';
    } else if (vy !== 0) {
      player.facing = vy > 0 ? 'down' : 'up';
    }

    if (isMoving) {
      player.walkCycle += dt * (isSprinting ? 12 : 7);
    }

    // --- 3. Pościg Egzaminatora za studentem ---
    // Profesor przyspiesza z każdym zebranym ECTS
    examiner.currentSpeed = examiner.baseSpeed + (ects / TARGET_ECTS) * 1.45;

    // Jeśli zamrożony przez Gemini AI - profesor stoi w paraliżu!
    if (freezeTimer > 0) {
      examiner.freezePulse += dt * 6;
      // Cząsteczki lodu / cyber-paraliżu wokół profesora
      if (Math.random() < 0.25) {
        particles.push({
          x: examiner.x + (Math.random() - 0.5) * 26,
          y: examiner.y + (Math.random() - 0.5) * 26,
          vx: 0,
          vy: -0.8,
          color: '#38bdf8',
          size: 2.5,
          life: 0.6,
          decay: 0.04,
        });
      }
    } else {
      // Aktywny pościg
      const dx = player.x - examiner.x;
      const dy = player.y - examiner.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0) {
        const exDirX = dx / dist;
        const exDirY = dy / dist;

        const exNextX = examiner.x + exDirX * examiner.currentSpeed;
        const exNextY = examiner.y + exDirY * examiner.currentSpeed;

        let moved = false;
        if (canMoveTo(exNextX, examiner.y, examiner.radius)) {
          examiner.x = exNextX;
          moved = true;
        }
        if (canMoveTo(examiner.x, exNextY, examiner.radius)) {
          examiner.y = exNextY;
          moved = true;
        }

        // Unikanie utknięcia na rogu ściany
        if (!moved) {
          if (canMoveTo(examiner.x + examiner.currentSpeed, examiner.y, examiner.radius)) {
            examiner.x += examiner.currentSpeed;
          } else if (canMoveTo(examiner.x - examiner.currentSpeed, examiner.y, examiner.radius)) {
            examiner.x -= examiner.currentSpeed;
          } else if (canMoveTo(examiner.x, examiner.y + examiner.currentSpeed, examiner.radius)) {
            examiner.y += examiner.currentSpeed;
          } else {
            examiner.y -= examiner.currentSpeed;
          }
        }

        examiner.facing = exDirX > 0 ? 'right' : 'left';
        examiner.walkCycle += dt * 7;
      }

      // Sprawdzenie kolizji egzaminatora ze studentem
      if (dist < (player.radius + examiner.radius)) {
        if (hasShield) {
          // Legitymacja ALK pochłania atak i ratuje studenta!
          hasShield = false;
          playSound('shield');
          triggerProfQuote('„Tym razem legitymacja Pana uratowała!”');

          // Odepchnięcie profesora i chwilowe oszołomienie
          examiner.x += (examiner.x - player.x) * 1.5;
          examiner.y += (examiner.y - player.y) * 1.5;

          // Rozbłysk ochronny
          for (let p = 0; p < 18; p++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos((p / 18) * Math.PI * 2) * 5,
              vy: Math.sin((p / 18) * Math.PI * 2) * 5,
              color: '#f2a900',
              size: 4,
              life: 0.6,
              decay: 0.04,
            });
          }
        } else {
          // Brak tarczy - przegrana i kampania wrześniowa
          triggerGameOver();
          return;
        }
      }
    }

    // --- 4. Zbieranie przedmiotów ze sceny ---
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const d = Math.hypot(player.x - item.x, player.y - item.y);

      if (d < player.radius + item.radius) {
        if (item.type === 'ects') {
          ects += 1;
          playSound('ects');

          // Efekt cząsteczkowy zebrania ECTS
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              color: '#f2a900',
              size: 3.5,
              life: 0.5,
              decay: 0.05,
            });
          }

          items.splice(i, 1);
          if (ects < TARGET_ECTS) {
            spawnItem('ects');
          }
        } else if (item.type === 'coffee') {
          coffeesDrunk++;
          coffeeTurboTime = 5; // 5 sekund turbo
          stamina = maxStamina;
          playSound('coffee');
          items.splice(i, 1);
          triggerProfQuote('„Czy ten esej pisał Pan, czy ChatGPT?!”');
          setTimeout(() => spawnItem('coffee'), 12000);
        } else if (item.type === 'gemini') {
          geminiUsed++;
          freezeTimer = 3.5; // 3.5 sekundy cyber-paraliżu profesora przez AI
          playSound('freeze');
          items.splice(i, 1);
          triggerProfQuote('„Błąd systemowy AI! Mój czerwony długopis został sparaliżowany!”');
          setTimeout(() => spawnItem('gemini'), 18000);
        } else if (item.type === 'card') {
          hasShield = true;
          playSound('shield');
          items.splice(i, 1);
          triggerProfQuote('„Widzę ważną legitymację ALK! Ma Pan jeszcze jedną szansę!”');
          setTimeout(() => spawnItem('card'), 22000);
        }

        // Warunek triumfu
        if (ects >= TARGET_ECTS) {
          triggerVictory();
          return;
        }
      }
    }

    // Aktualizacja cząsteczek
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

  // --- Rysowanie Sceny Canvas (800x540) ---
  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Tło korytarzy ALK
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Kafelki podłogowe korytarza
    ctx.strokeStyle = 'rgba(0, 75, 135, 0.22)';
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

    // 2. Centralny plac: Patio ALK 🌿
    ctx.fillStyle = '#1b4324';
    ctx.fillRect(PATIO.x, PATIO.y, PATIO.w, PATIO.h);

    // Kostka brukowa ścieżek krzyżowych na Patio
    ctx.fillStyle = '#26384d';
    ctx.fillRect(PATIO.x + PATIO.w / 2 - 24, PATIO.y, 48, PATIO.h);
    ctx.fillRect(PATIO.x, PATIO.y + PATIO.h / 2 - 24, PATIO.w, 48);

    // Ozdobna trawa i kępki zieleni
    ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
    for (let i = 0; i < 28; i++) {
      const gx = PATIO.x + 15 + ((i * 43) % (PATIO.w - 30));
      const gy = PATIO.y + 15 + ((i * 37) % (PATIO.h - 30));
      ctx.fillRect(gx, gy, 5, 5);
    }

    // Etykieta centralna: Patio ALK 🌿
    ctx.font = '700 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#86efac';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Patio ALK 🌿', PATIO.x + PATIO.w / 2, PATIO.y + 24);

    // Cokół i monument Lwa Koźmińskiego w centrum
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(382, 252, 36, 36);
    ctx.strokeStyle = '#f2a900';
    ctx.lineWidth = 2;
    ctx.strokeRect(382, 252, 36, 36);

    ctx.font = '20px sans-serif';
    ctx.fillText('🦁', 400, 270);

    // 3. Etykiety sal: „Aula A”, „Biblioteka”, „Dziekanat”, „Lab Komputerowy”
    for (const room of ROOMS) {
      ctx.font = '700 12px "Space Grotesk", sans-serif';
      ctx.fillStyle = room.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.name, room.x, room.y - 42);

      // Subtelny obrys strefy
      ctx.strokeStyle = 'rgba(242, 169, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(room.x - 50, room.y - 56, 100, 28);
    }

    // 4. Ściany i aule z obramowaniami
    for (const wall of WALLS) {
      if (wall.isMonument) continue;

      ctx.fillStyle = '#002244';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

      ctx.strokeStyle = '#f2a900';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Wewnętrzne wypełnienie akcentem niebieskim ALK
      ctx.fillStyle = 'rgba(0, 75, 135, 0.5)';
      ctx.fillRect(wall.x + 2, wall.y + 2, Math.max(0, wall.w - 4), Math.max(0, wall.h - 4));
    }

    // 5. Rysowanie przedmiotów (ECTS, Kawa, Gemini AI, Legitymacja ALK)
    const timeSec = Date.now() / 1000;
    for (const item of items) {
      const bob = Math.sin(timeSec * 4.5 + item.bobOffset) * 3;
      const iy = item.y + bob;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (item.type === 'ects') {
        // 📜 ECTS
        ctx.fillStyle = 'rgba(242, 169, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(item.x, iy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillText('📜', item.x, iy);

        ctx.font = '700 9px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffc740';
        ctx.fillText('+1 ECTS', item.x, iy + 14);
      } else if (item.type === 'coffee') {
        // ☕ Kawa z Patio ALK
        ctx.fillStyle = 'rgba(0, 163, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(item.x, iy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillText('☕', item.x, iy);

        ctx.font = '700 8px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('TURBO', item.x, iy + 14);
      } else if (item.type === 'gemini') {
        // 💻 Gemini AI
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(item.x, iy, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillText('💻', item.x, iy);

        ctx.font = '700 8px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('GEMINI AI', item.x, iy + 14);
      } else if (item.type === 'card') {
        // 🪪 Legitymacja ALK (Tarcza)
        ctx.fillStyle = 'rgba(242, 169, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(item.x, iy, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillText('🪪', item.x, iy);

        ctx.font = '700 8px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffc740';
        ctx.fillText('TARCZA', item.x, iy + 14);
      }
    }

    // 6. Cząsteczki
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 7. Renderowanie Gracza (Student)
    drawStudent(player.x, player.y, player.facing, player.walkCycle, isSprinting, coffeeTurboTime > 0, hasShield);

    // 8. Renderowanie Egzaminatora (Profesor z czerwonym długopisem)
    drawExaminer(examiner.x, examiner.y, examiner.facing, examiner.walkCycle, freezeTimer > 0);
  }

  // --- Student (Ty) z bluzą ALK i opcjonalną tarczą Legitymacji ---
  function drawStudent(x, y, facing, cycle, sprinting, turbo, shieldActive) {
    ctx.save();
    ctx.translate(x, y);

    // Efekt Tarczy Legitymacji ALK
    if (shieldActive) {
      const shieldRot = (Date.now() / 200) % (Math.PI * 2);
      ctx.save();
      ctx.rotate(shieldRot);
      ctx.strokeStyle = '#f2a900';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(242, 169, 0, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // Poświata Turbo / Sprintu
    if (turbo) {
      ctx.fillStyle = 'rgba(255, 199, 64, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (sprinting) {
      ctx.fillStyle = 'rgba(0, 163, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cień
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 11, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ciało - Bluza uczelniana ALK (Główny granat #002244)
    ctx.fillStyle = '#002244';
    ctx.fillRect(-7, -4, 14, 15);

    // Złoty herb/napis ALK
    ctx.fillStyle = '#f2a900';
    ctx.fillRect(-3, 0, 6, 4);

    // Plecak studenta
    ctx.fillStyle = '#475569';
    if (facing === 'down') ctx.fillRect(-5, -2, 10, 5);
    else if (facing === 'up') ctx.fillRect(-6, -4, 12, 8);
    else if (facing === 'left') ctx.fillRect(2, -3, 5, 10);
    else ctx.fillRect(-7, -3, 5, 10);

    // Głowa
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -9, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Czapka studencka / biret ALK
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(-8, -15, 16, 5);
    ctx.fillStyle = '#f2a900';
    ctx.fillRect(4, -13, 2, 7); // chwost

    // Nóżki i animacja biegu
    const leg = Math.sin(cycle) * 3.5;
    ctx.fillStyle = '#004b87';
    ctx.fillRect(-5, 11, 3.5, 5 + (facing === 'left' || facing === 'right' ? leg : 0));
    ctx.fillRect(1.5, 11, 3.5, 5 - (facing === 'left' || facing === 'right' ? leg : 0));

    ctx.restore();
  }

  // --- Egzaminator (Profesor z czerwonym długopisem) ---
  function drawExaminer(x, y, facing, cycle, isFrozen) {
    ctx.save();
    ctx.translate(x, y);

    // Jeśli zamrożony przez Gemini AI - cybernetyczna aura lodowa
    if (isFrozen) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', 0, -24);
    } else {
      // Groźna aura czerwonego długopisu
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cień
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Garnitur profesora
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -4, 16, 16);

    // Czerwony krawat
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, -3, 4, 10);

    // Głowa
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -9, 8, 0, Math.PI * 2);
    ctx.fill();

    // Siwe włosy profesorskie
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, -12, 8.5, Math.PI, Math.PI * 2);
    ctx.fill();

    // Okulary
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-5, -11, 4, 3);
    ctx.strokeRect(1, -11, 4, 3);

    // Nóżki
    const leg = isFrozen ? 0 : Math.sin(cycle) * 3;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, 12, 3.5, 5 + leg);
    ctx.fillRect(2.5, 12, 3.5, 5 - leg);

    // SŁYNNY CZERWONY DŁUGOPIS
    const penPulse = isFrozen ? 0 : Math.sin(Date.now() / 140) * 2;
    const penX = facing === 'left' ? -14 : 12;
    const penY = penPulse;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(penX + 2, penY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(penX, penY - 4);
    ctx.lineTo(penX + 3, penY + 7);
    ctx.stroke();

    ctx.restore();
  }

  // --- Główna pętla renderowania (60 FPS) ---
  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min(0.08, (now - lastTime) / 1000);
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // --- Obsługa Klawiatury (WASD / Strzałki / Spacja / Shift) ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
      input.sprint = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      input.up = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      input.down = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      input.left = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      input.right = true;
      e.preventDefault();
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      togglePause();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
      input.sprint = false;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
  });

  // --- Obsługa Wirtualnego Sterowania Dotykowego (#mobile-controls) ---
  function setupTouchButton(el, keyProp) {
    if (!el) return;
    const activate = (e) => {
      e.preventDefault();
      input[keyProp] = true;
      el.classList.add('active');
    };
    const deactivate = (e) => {
      e.preventDefault();
      input[keyProp] = false;
      el.classList.remove('active');
    };

    el.addEventListener('pointerdown', activate);
    el.addEventListener('pointerup', deactivate);
    el.addEventListener('pointercancel', deactivate);
    el.addEventListener('pointerleave', deactivate);
  }

  setupTouchButton(dpadUp, 'up');
  setupTouchButton(dpadDown, 'down');
  setupTouchButton(dpadLeft, 'left');
  setupTouchButton(dpadRight, 'right');
  setupTouchButton(touchSprint, 'sprint');

  // --- Pauza i Wyciszenie Dźwięku ---
  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      if (pauseIcon) pauseIcon.textContent = '▶️';
      if (statusText) statusText.textContent = 'Pauza. Kliknij P lub ikonę, by wznowić sesję!';
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      if (pauseIcon) pauseIcon.textContent = '⏸️';
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.soundSystem) {
        const isMuted = window.soundSystem.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  if (pauseToggleBtn) {
    pauseToggleBtn.addEventListener('click', togglePause);
  }

  // --- Podpięcie Przycisków w Oknach Modalnych ---
  if (startGameBtn) startGameBtn.addEventListener('click', startGame);
  if (restartGameBtn) restartGameBtn.addEventListener('click', startGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', startGame);

  // Pierwsza inicjalizacja planszy i pętli
  initCampusItems();
  updateHUD();
  requestAnimationFrame(gameLoop);
})();
