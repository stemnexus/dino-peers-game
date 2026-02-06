/* ===============================
   DINO PEERS GAME - game.js (FULL)
   - Start/Reset works
   - Dino selection works
   - Arrow keys move, Space jump
   - Coin -> Pause -> Question modal
   - Questions shuffled, no repeat
================================= */

(() => {
  // ========= SELECTOR MAP (kalau HTML kau ID lain, adjust sini je) =========
  const SEL = {
    canvas: "#gameCanvas",

    // Start/Reset (support banyak kemungkinan ID / data-attr)
    startBtn: "#startBtn, #btnStart, [data-action='start'], .btnStart",
    resetBtn: "#resetBtn, #btnReset, [data-action='reset'], .btnReset",

    // Inputs
    nama: "#nama, #playerName, input[name='nama']",
    kelas: "#kelas, #playerClass, input[name='kelas']",
    world: "#world, #worldSelect, select[name='world']",

    // Dino cards (pilihan)
    dinoCards: "[data-dino], .dinoCard",

    // HUD
    score: "#scoreVal, #score, .scoreVal",
    lives: "#livesVal, #nyawa, .livesVal",
    masa: "#timeVal, #masa, .timeVal",
    soalanCount: "#soalanCount, #statusSoalan, .soalanCount",
    coinCount: "#coinCount, #statusCoin, .coinCount",
    log: "#log, .log",

    // Optional: wrapper (kalau kau ada overlay “READY?”)
    readyOverlay: "#readyOverlay, .readyOverlay"
  };

  // ========= helpers =========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const pickEl = (selList) => {
    const parts = selList.split(",").map(s => s.trim());
    for (const p of parts) {
      const el = document.querySelector(p);
      if (el) return el;
    }
    return null;
  };

  const logBox = () => pickEl(SEL.log);
  const log = (msg) => {
    console.log(msg);
    const box = logBox();
    if (box) {
      const line = document.createElement("div");
      line.textContent = msg;
      box.prepend(line);
    }
  };

  // ========= simple shuffle =========
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ========= QUESTIONS (demo) =========
  // Kau boleh ganti ikut CSV/JSON nanti. Sekarang aku buat 5 soalan/world.
  const QUESTION_BANK = {
    "World 1": [
      { q: "Penyalahgunaan dadah boleh menyebabkan...", a: ["Ketagihan", "Lebih sihat", "Tidur lena", "Lebih fokus"], correct: 0 },
      { q: "Alkohol boleh memberi kesan kepada...", a: ["Organ badan", "Tambah stamina", "Tambah fokus", "Minda lebih stabil"], correct: 0 },
      { q: "Menolak ajakan rakan untuk vape ialah tindakan...", a: ["Bijak", "Memalukan", "Lemah", "Tidak perlu"], correct: 0 },
      { q: "Ubat tanpa nasihat doktor adalah...", a: ["Berisiko", "Selamat", "Wajib", "Sihat"], correct: 0 },
      { q: "Penyalahgunaan bahan boleh menjejaskan...", a: ["Masa depan", "Bakat jadi genius", "Markah confirm naik", "Fokus jadi tajam"], correct: 0 },
    ],
    "World 2": [
      { q: "Tidur cukup penting untuk...", a: ["Kesihatan emosi", "Jadi malas", "Tambah stres", "Marah cepat"], correct: 0 },
      { q: "Berkongsi masalah boleh...", a: ["Kurangkan tekanan", "Tambah panik", "Tak ada kesan", "Buat makin teruk"], correct: 0 },
      { q: "Bersenam boleh bantu...", a: ["Mental & emosi", "Stres bertambah", "Susah tidur", "Cepat marah"], correct: 0 },
      { q: "Tarik nafas dalam boleh...", a: ["Tenangkan diri", "Buat pening semata", "Hilangkan tidur", "Tambah marah"], correct: 0 },
      { q: "Kaunseling ialah tindakan...", a: ["Baik", "Memalukan", "Tak berguna", "Buang masa"], correct: 0 },
    ],
    "World 3": [
      { q: "Komunikasi dalam keluarga penting untuk...", a: ["Eratkan hubungan", "Bergaduh lagi", "Jauhkan diri", "Tak perlu"], correct: 0 },
      { q: "Menolong kerja rumah menunjukkan...", a: ["Tanggungjawab", "Malas", "Tak sopan", "Menyusahkan"], correct: 0 },
      { q: "Hormati ibu bapa ialah nilai...", a: ["Penting", "Tak relevan", "Ketinggalan", "Mengarut"], correct: 0 },
      { q: "Meluangkan masa bersama keluarga adalah...", a: ["Baik", "Membazir", "Merugikan", "Tak perlu"], correct: 0 },
      { q: "Saling membantu adik-beradik akan...", a: ["Menguatkan hubungan", "Menyusahkan", "Buat benci", "Tak ada kesan"], correct: 0 },
    ],
  };

  // ========= GAME STATE =========
  const state = {
    running: false,
    pausedForQuestion: false,
    score: 0,
    lives: 3,
    coins: 0,
    answered: 0,
    maxQuestions: 5,
    startTime: 0,
    elapsedMs: 0,

    currentWorldKey: "World 1",
    questionQueue: [],
    askedSet: new Set(),

    dinoKey: "hijau",
    dinoImg: null,

    keys: { left: false, right: false, jump: false }
  };

  // ========= CANVAS SETUP =========
  const canvas = pickEl(SEL.canvas) || (() => {
    // fallback: create canvas kalau tak wujud
    const c = document.createElement("canvas");
    c.id = "gameCanvas";
    c.width = 1100;
    c.height = 420;
    c.style.width = "100%";
    c.style.borderRadius = "18px";
    c.style.display = "block";
    const target = document.body;
    target.prepend(c);
    return c;
  })();

  const ctx = canvas.getContext("2d");

  // ========= WORLD PHYSICS =========
  const world = {
    gravity: 0.7,
    groundY: () => canvas.height - 70
  };

  const player = {
    x: 120,
    y: 0,
    w: 64,
    h: 64,
    vx: 0,
    vy: 0,
    speed: 4.2,
    jumpPower: 13.5,
    onGround: false
  };

  const obstacles = []; // wall / lubang style
  const coins = [];

  function resetLevel() {
    player.x = 120;
    player.y = world.groundY() - player.h;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;

    obstacles.length = 0;
    coins.length = 0;

    // simple obstacles: 2 wall + 1 gap
    // wall
    obstacles.push({ type: "wall", x: 520, y: world.groundY() - 90, w: 36, h: 90 });
    obstacles.push({ type: "wall", x: 860, y: world.groundY() - 120, w: 36, h: 120 });

    // gap (lubang)
    obstacles.push({ type: "gap", x: 670, w: 120 });

    spawnCoin();
  }

  function spawnCoin() {
    // spawn coin random but avoid gap area
    const minX = 260;
    const maxX = canvas.width - 120;
    let x = minX + Math.random() * (maxX - minX);

    // avoid gap region
    const gap = obstacles.find(o => o.type === "gap");
    if (gap && x > gap.x - 40 && x < gap.x + gap.w + 40) x = gap.x - 70;

    coins.push({ x, y: world.groundY() - 130, r: 14, taken: false });
  }

  // ========= ASSETS =========
  const DINO_ASSETS = {
    hijau: "assets/dino1.png",
    oren: "assets/dino2.png",
    merah: "assets/dino3.png",
    ungu: "assets/dino4.png"
  };

  function loadDino(key) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        log(`❌ gagal load dino: ${DINO_ASSETS[key]}`);
        resolve(null);
      };
      img.src = DINO_ASSETS[key];
    });
  }

  // ========= UI references =========
  const startBtn = pickEl(SEL.startBtn);
  const resetBtn = pickEl(SEL.resetBtn);
  const worldSelect = pickEl(SEL.world);
  const readyOverlay = pickEl(SEL.readyOverlay);

  const scoreEl = pickEl(SEL.score);
  const livesEl = pickEl(SEL.lives);
  const masaEl = pickEl(SEL.masa);
  const soalanEl = pickEl(SEL.soalanCount);
  const coinEl = pickEl(SEL.coinCount);

  function setHUD() {
    if (scoreEl) scoreEl.textContent = state.score;
    if (livesEl) livesEl.textContent = state.lives;
    if (coinEl) coinEl.textContent = state.coins;
    if (soalanEl) soalanEl.textContent = `${state.answered}/${state.maxQuestions}`;

    const sec = Math.floor(state.elapsedMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    if (masaEl) masaEl.textContent = `${mm}:${ss}`;
  }

  // ========= QUESTION MODAL (auto-create jika HTML tak ada) =========
  let modal, qText, answersWrap, modalClose;

  function ensureModal() {
    if (modal) return;

    modal = document.querySelector("#questionModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "questionModal";
      modal.style.cssText = `
        position: fixed; inset: 0; display:none; align-items:center; justify-content:center;
        background: rgba(0,0,0,.55); z-index: 9999;
      `;
      modal.innerHTML = `
        <div style="
          width: min(520px, 92vw);
          border-radius: 18px;
          padding: 18px;
          background: rgba(10,18,35,.95);
          border: 1px solid rgba(90,200,255,.28);
          box-shadow: 0 0 28px rgba(60,200,255,.28);
          color: #eaf6ff;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        ">
          <div id="questionText" style="font-size:18px; font-weight:800; margin-bottom:12px;"></div>
          <div id="answers" style="display:grid; gap:10px;"></div>
          <button id="closeModal" style="
            margin-top: 14px;
            width: 100%;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.15);
            background: rgba(255,255,255,.08);
            color: #fff;
            cursor:pointer;
          ">Tutup</button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    qText = modal.querySelector("#questionText");
    answersWrap = modal.querySelector("#answers");
    modalClose = modal.querySelector("#closeModal");

    modalClose.addEventListener("click", () => {
      // kalau user tekan tutup tanpa jawab, kita kira salah (bagi game ada consequence)
      if (state.pausedForQuestion) {
        state.lives = Math.max(0, state.lives - 1);
        log("⚠️ Soalan ditutup tanpa jawab → -1 nyawa");
        endQuestionAndResume();
      }
    });
  }

  function openQuestion() {
    ensureModal();

    // stop game
    state.pausedForQuestion = true;
    state.running = true; // still "in session" but paused

    const q = nextQuestion();
    if (!q) {
      log("✅ Soalan dah habis untuk world ni.");
      endQuestionAndResume();
      return;
    }

    qText.textContent = q.q;
    answersWrap.innerHTML = "";

    q.a.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.style.cssText = `
        text-align:left;
        padding: 12px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.06);
        color: #eaf6ff;
        cursor:pointer;
        font-weight:600;
      `;
      btn.addEventListener("click", () => {
        const correct = idx === q.correct;
        if (correct) {
          state.score += 10;
          state.answered += 1;
          log("✅ Betul! +10 skor");
        } else {
          state.lives = Math.max(0, state.lives - 1);
          state.answered += 1;
          log("❌ Salah! -1 nyawa");
        }
        endQuestionAndResume();
      });
      answersWrap.appendChild(btn);
    });

    modal.style.display = "flex";
    setHUD();
  }

  function endQuestionAndResume() {
    if (modal) modal.style.display = "none";
    state.pausedForQuestion = false;

    // spawn next coin
    coins.length = 0;
    spawnCoin();

    // end conditions
    if (state.lives <= 0) {
      gameOver();
      return;
    }
    if (state.answered >= state.maxQuestions) {
      missionComplete();
      return;
    }

    setHUD();
  }

  function buildQuestionQueue() {
    const key = state.currentWorldKey;
    const bank = QUESTION_BANK[key] || QUESTION_BANK["World 1"];
    state.questionQueue = shuffle(bank);
    state.askedSet.clear();
  }

  function nextQuestion() {
    while (state.questionQueue.length) {
      const q = state.questionQueue.shift();
      const signature = q.q;
      if (!state.askedSet.has(signature)) {
        state.askedSet.add(signature);
        return q;
      }
    }
    return null;
  }

  // ========= controls =========
  function bindControls() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft") state.keys.left = true;
      if (e.code === "ArrowRight") state.keys.right = true;
      if (e.code === "Space") state.keys.jump = true;
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft") state.keys.left = false;
      if (e.code === "ArrowRight") state.keys.right = false;
      if (e.code === "Space") state.keys.jump = false;
    });

    // Start/Reset
    if (startBtn) {
      startBtn.addEventListener("click", () => startGame());
    } else {
      log("⚠️ Start button tak jumpa. Pastikan ada #startBtn atau data-action='start'");
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetGame(true));
    } else {
      log("⚠️ Reset button tak jumpa. Pastikan ada #resetBtn atau data-action='reset'");
    }

    // World change
    if (worldSelect) {
      worldSelect.addEventListener("change", () => {
        const val = worldSelect.value || "World 1";
        // normalize label
        if (val.toLowerCase().includes("world 2")) state.currentWorldKey = "World 2";
        else if (val.toLowerCase().includes("world 3")) state.currentWorldKey = "World 3";
        else state.currentWorldKey = "World 1";

        log(`🌍 Tukar world: ${state.currentWorldKey}`);
        buildQuestionQueue();
        resetGame(false);
      });
    }

    // Dino selection cards
    const cards = $$(SEL.dinoCards);
    if (cards.length) {
      cards.forEach((card) => {
        card.addEventListener("click", async () => {
          const key = (card.getAttribute("data-dino") || card.dataset?.dino || "").toLowerCase();
          const mapped =
            key.includes("hijau") ? "hijau" :
            key.includes("oren") ? "oren" :
            key.includes("merah") ? "merah" :
            key.includes("ungu") ? "ungu" :
            null;

          if (!mapped) {
            // fallback: try from text
            const t = (card.textContent || "").toLowerCase();
            const fallback =
              t.includes("hijau") ? "hijau" :
              t.includes("oren") ? "oren" :
              t.includes("merah") ? "merah" :
              t.includes("ungu") ? "ungu" : null;
            if (!fallback) return;
            await selectDino(fallback);
            return;
          }

          await selectDino(mapped);
        });
      });
    } else {
      log("⚠️ Dino card tak jumpa. Pastikan ada element [data-dino='hijau'] etc.");
    }
  }

  async function selectDino(key) {
    state.dinoKey = key;
    state.dinoImg = await loadDino(key);
    log(`🦖 Dino dipilih: ${key}`);
    // optional highlight UI
    $$(SEL.dinoCards).forEach(c => c.classList.remove("active"));
    const match = $$(SEL.dinoCards).find(c => (c.getAttribute("data-dino") || "").toLowerCase().includes(key));
    if (match) match.classList.add("active");
  }

  // ========= game loop =========
  function startGame() {
    if (!state.dinoImg) {
      // auto load default
      selectDino(state.dinoKey);
    }

    // require name & class (optional, but you asked)
    const namaEl = pickEl(SEL.nama);
    const kelasEl = pickEl(SEL.kelas);
    const nama = (namaEl?.value || "").trim();
    const kelas = (kelasEl?.value || "").trim();
    if (!nama || !kelas) {
      log("⚠️ Isi Nama & Kelas dulu (kalau nak enforce).");
      // kalau kau nak strict, uncomment bawah:
      // return;
    }

    if (readyOverlay) readyOverlay.style.display = "none";

    state.running = true;
    state.pausedForQuestion = false;
    state.startTime = performance.now();
    log("▶️ Game Start");
  }

  function resetGame(full = true) {
    state.running = false;
    state.pausedForQuestion = false;

    if (full) {
      state.score = 0;
      state.lives = 3;
      state.coins = 0;
      state.answered = 0;
      state.startTime = 0;
      state.elapsedMs = 0;
      buildQuestionQueue();
    }

    resetLevel();
    setHUD();
    render(); // draw still frame
    log("🔁 Reset");
  }

  function gameOver() {
    state.running = false;
    state.pausedForQuestion = false;
    setHUD();
    alert("Game Over 😵");
    log("💀 Game Over");
  }

  function missionComplete() {
    state.running = false;
    state.pausedForQuestion = false;
    setHUD();
    alert("Misi Selesai! 🎉");
    log("🏁 Misi Selesai");
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  function update(dt) {
    if (!state.running || state.pausedForQuestion) return;

    // time
    state.elapsedMs = performance.now() - state.startTime;

    // controls
    player.vx = 0;
    if (state.keys.left) player.vx = -player.speed;
    if (state.keys.right) player.vx = player.speed;

    // jump
    if (state.keys.jump && player.onGround) {
      player.vy = -player.jumpPower;
      player.onGround = false;
    }

    // apply physics
    player.x += player.vx;
    player.vy += world.gravity;
    player.y += player.vy;

    // bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    // ground
    const gy = world.groundY();
    if (player.y + player.h >= gy) {
      player.y = gy - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    // gap check
    const gap = obstacles.find(o => o.type === "gap");
    if (gap) {
      const onGapX = (player.x + player.w * 0.5) > gap.x && (player.x + player.w * 0.5) < (gap.x + gap.w);
      if (onGapX && player.y + player.h >= gy - 1) {
        // fall into hole -> lose life and reset position
        state.lives = Math.max(0, state.lives - 1);
        log("🕳️ Jatuh lubang! -1 nyawa");
        resetLevel();
        if (state.lives <= 0) gameOver();
      }
    }

    // wall collision
    obstacles.filter(o => o.type === "wall").forEach(w => {
      const p = { x: player.x, y: player.y, w: player.w, h: player.h };
      const b = { x: w.x, y: w.y, w: w.w, h: w.h };
      if (rectsOverlap(p, b)) {
        // simple pushback
        if (player.vx > 0) player.x = w.x - player.w;
        if (player.vx < 0) player.x = w.x + w.w;
      }
    });

    // coin pickup
    coins.forEach(c => {
      if (c.taken) return;
      const dx = (player.x + player.w / 2) - c.x;
      const dy = (player.y + player.h / 2) - c.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < c.r + 22) {
        c.taken = true;
        state.coins += 1;
        log("🪙 Coin diambil → keluar soalan (PAUSE)");
        setHUD();
        openQuestion();
      }
    });

    setHUD();
  }

  function render() {
    // background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "rgba(80,170,255,.35)");
    g.addColorStop(1, "rgba(10,25,45,.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ground
    const gy = world.groundY();
    ctx.fillStyle = "rgba(60,180,90,.35)";
    ctx.fillRect(0, gy, canvas.width, canvas.height - gy);

    // gap visual
    const gap = obstacles.find(o => o.type === "gap");
    if (gap) {
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(gap.x, gy, gap.w, canvas.height - gy);
    }

    // walls
    obstacles.filter(o => o.type === "wall").forEach(w => {
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = "rgba(120,220,255,.25)";
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // coins
    coins.forEach(c => {
      if (c.taken) return;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,215,0,.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.stroke();
    });

    // player (dino)
    if (state.dinoImg) {
      ctx.drawImage(state.dinoImg, player.x, player.y, player.w, player.h);
    } else {
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    // paused overlay hint
    if (state.pausedForQuestion) {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.font = "700 20px system-ui, Segoe UI, Arial";
      ctx.fillText("PAUSE: Jawab soalan dulu…", 24, 40);
    }
  }

  // ========= main loop =========
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(32, now - last);
    last = now;

    update(dt);
    render();

    requestAnimationFrame(loop);
  }

  // ========= init =========
  function init() {
    // set canvas size responsif (optional)
    // kalau kau dah set width/height di HTML, boleh ignore.
    canvas.width = canvas.width || 1100;
    canvas.height = canvas.height || 420;

    // default world based on select
    if (worldSelect) {
      const val = worldSelect.value || "World 1";
      if (val.toLowerCase().includes("world 2")) state.currentWorldKey = "World 2";
      else if (val.toLowerCase().includes("world 3")) state.currentWorldKey = "World 3";
      else state.currentWorldKey = "World 1";
    }

    buildQuestionQueue();
    resetGame(true);
    bindControls();
    selectDino("hijau"); // default load

    // global error to log
    window.addEventListener("error", (e) => {
      log(`❌ JS Error: ${e.message}`);
    });

    requestAnimationFrame(loop);
    log("✅ game.js loaded & running");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
