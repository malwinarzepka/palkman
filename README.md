# 🎓 Kozminski Escape: Polowanie na ECTS

> Dynamiczna zręcznościowa gra 2D w klimacie retro-arcade, osadzona w murach prestiżowej **Akademii Leona Koźmińskiego (ALK)** w Warszawie przy ul. Jagiellońskiej 57/59.

---

## 🏛️ 1. Fabuła (Lore) i Zasady Gry

Trwa zimowa sesja egzaminacyjna. Korytarzami uczelni – od Auli A, przez Bibliotekę i Dziekanat, aż po słynne **zielone Patio ALK z pomnikiem Lwa** – krąży surowy **Profesor Egzaminator** uzbrojony w bezlitosny czerwony długopis. Każde bezpośrednie spotkanie grozi dopisaniem dwói i odesłaniem do legendarnej **Kampanii Wrześniowej**!

### Cel gry:
- Zbierz **30 punktów ECTS**, aby zaliczyć semestr w pierwszym terminie i otrzymać wpis do indeksu z oceną Rektora (do 5.5).
- Uciekaj przed profesorem, który **przyspiesza z każdym zebranym przez Ciebie punktem ECTS**!

### Przedmioty na Kampusie:
- 📜 **ECTS (+1 punkt)**: Indeksy i zaliczenia rozrzucone po aulach. Zbierz 30, aby wygrać!
- ☕ **Kawa z Patio ALK**: 5 sekund potężnego turbo-przyspieszenia oraz natychmiastowe odnowienie paska staminy.
- 💻 **Gemini AI**: Cybernetyczny paraliż sztucznej inteligencji zamraża profesora w bryle lodu `❄️` na 3.5 sekundy.
- 🪪 **Legitymacja ALK**: Złota tarcza studencka, która absorbuje jedno bezpośrednie trafienie czerwonym długopisem i odpycha egzaminatora.

---

## 📁 2. Struktura Projektu

Projekt został zaprojektowany w czystej, modularnej architekturze bez konieczności pobierania zewnętrznych bibliotek czy plików audio:

```text
kozminski-escape/
│
├── index.html          # Semantyczny szkielet HTML5 (HUD, Canvas 800x540, dymek cytatów, modale)
│
├── css/
│   └── style.css       # Oficjalna paleta ALK (#002244, #f2a900), szklany HUD, animowany dymek
│
├── js/
│   ├── audio.js        # SoundSystem – syntezator 8-bitowych efektów dźwiękowych (Web Audio API)
│   └── game.js         # Serce gry: fizyka wektorowa, AI ścigania, kolizje ze ścianami i pętla 60 FPS
│
└── README.md           # Dokumentacja projektu, zasady i opis sterowania
```

---

## 🎮 3. Instrukcja Sterowania

Gra jest w pełni responsywna – automatycznie dopasowuje się do komputerów stacjonarnych, laptopów, tabletów oraz smartfonów.

### 💻 Komputery PC / Mac (Desktop):
| Klawisz | Akcja |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> lub <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Ruch studenta (znormalizowany wektor 8-kierunkowy) |
| <kbd>Shift</kbd> lub <kbd>Spacja</kbd> | **Sprint** (zużywa staminę; postój odnawia ją szybciej) |
| <kbd>P</kbd> lub <kbd>Esc</kbd> | Pauza / Wznowienie rozgrywki |
| Kliknięcie w ikonę 🔊 / ⏸️ | Wyciszenie dźwięku / Pauza z poziomu HUD |

### 📱 Smartfony i Tablety (Mobile-First):
W widokach poniżej 768px na dole ekranu automatycznie aktywuje się ergonomiczny panel dotykowy:
- **Krzyżak D-pad** (po lewej stronie): Płynne sterowanie kierunkiem poruszania się.
- **Przycisk SPRINT ⚡** (po prawej stronie): Przytrzymanie aktywuje bieg sprinterski.
- **Interaktywny HUD**: Dotknięcie ikony głośnika wycisza lub włącza syntezator audio.

---

## 🦁 O Uczelni

**Akademia Leona Koźmińskiego (ALK)** to wiodąca uczelnia biznesowa w Europie Środkowo-Wschodniej, posiadająca prestiżową potrójną koronę akredytacyjną (EQUIS, AMBA, AACSB). Gra powstała jako hołd dla studenckiej społeczności i unikalnego klimatu kampusu przy ul. Jagiellońskiej w Warszawie.
