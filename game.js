/*************************************************
 * DINO PEERS GAME - game.js (FIXED)
 * - Dino select buttons (Hijau/Merah/Biru/Oren) WORK
 * - Coin appears & moves
 * - Coin pickup triggers question modal (or alert fallback)
 * - Space jump
 *************************************************/

const GRAVITY = 0.65;
const JUMP_POWER = 13;
const GROUND_Y = 40;          // ikut style: ground lebih kurang 40px
const SPEED_BASE = 4.2;       // laju asas

// ===== DOM (wajib ada dalam HTML) =====
const game = document.getElementById("game");
const dino = document.getElementById("dino");

const btnStart = document.getElementById("btnStart");
const btnReset = document.getElementById("btnReset");
const selWorld = document.getElementById("selWorld");

const hudWorld = document.getElementById("hudWorld");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");

// ===== MODAL soalan (kalau ada) =====
const modal = document.getElementById("modal");
const qWorldTag = document.getElementById("qWorldTag");
const qText = document.getElementById("qText");
const qOptions = document.getElementById("qOptions");
const qFeedback = document.getElementById("qFeedback");
const btnSubmit = document.getElementById("btnSubmit");

// ====== STATE ======
let isRunning = false;
let pausedQuestion = false;

let world = 1;
let score = 0;
let lives = 3;

let dinoY = GROUND_Y;
let vy = 0;
let onGround = true;

let obstacles = [];
let coins = [];

let lastTime = 0;
let nextObstacleAt = 0;
let nextCoinAt = 0;

// ====== QUESTION BANK (sample dulu) ======
const QUESTIONS = {
  1: [
    { q:"Penyalahgunaan bahan boleh menyebabkan…", a:["Ketagihan","Lebih fokus","Lebih sihat","Tidur lena"], c:0 },
    { q:"Jika rakan ajak cuba bahan terlarang, tindakan terbaik ialah…", a:["Tolak & jauhi","Cuba sikit","Diam saja","Ikut kawan"], c:0 },
  ],
  2: [
    { q:"Stres ialah…", a:["Tekanan mental/emosi","Penyakit gigi","Kecederaan","Masalah mata"], c:0 },
    { q:"Cara urus stres yang betul…", a:["Rehat & dapatkan sokongan","Ponteng sekolah","Ambil bahan terlarang","Pendam sampai meletup"], c:0 },
  ],
  3: [
    { q:"Komunikasi keluarga penting untuk…", a:["Elak salah faham","Tambah konflik","Senyap selamanya","Membuli"], c:0 },
    { q:"Peranan remaja dalam keluarga ialah…", a:["Hormati & bantu","Tak peduli","Lawannya selalu","Buat hal sendiri"], c:0 },
  ]
};

let qIndex = {1:0,2:0,3:0};
let selectedOption = null;
let currentQuestion = null;
let coinRef = null;

// ====== DINO SPRITE CONTROL ======
function setDino(color){
  // pastikan class asas dino ada
  dino.classList.add("dino");

  // buang semua warna
  dino.classList.remove("dino-green","dino-red","dino-blue","dino-orange");

  // add yang dipilih
  dino.classList.add(`dino-${color}`);
}

// ====== PILIH DINO (ikut button text macam screenshot) ======
function bindDinoButtons(){
  // cari semua button dalam panel yang text dia Hijau/Merah/Biru/Oren
  const allButtons = Array.from(document.querySelectorAll("button"));

  const pickBtns = allButtons.filter(b => {
    const t = (b.textContent || "").trim().toLowerCase();
    return ["hijau","merah","biru","oren"].includes(t);
  });

  if (pickBtns.length === 0) return;

  // default active style (optional)
  function setActive(btn){
    pickBtns.forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
  }

  pickBtns.forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.preventDefault();
      const t = (btn.textContent || "").trim().toLowerCase();
      if (t === "hijau") setDino("green");
      if (t === "merah") setDino("red");
      if (t === "biru") setDino("blue");
      if (t === "oren") setDino("orange");
      setActive(btn);
    });
  });

  // set default based on first button
  setActive(pickBtns[0]);
}

// ====== HUD ======
function updateHUD(){
  if (hudWorld) hudWorld.textContent = `World: ${world}`;
  if (hudScore) hudScore.textContent = `Score: ${score}`;
  if (hudLives) hudLives.textContent = `Lives: ${lives}`;
}

// ====== RESET GAME ======
function resetGame(){
  isRunning = false;
  pausedQuestion = false;

  world = Number(selWorld?.value || 1);
  score = 0;
  lives = 3;

  dinoY = GROUND_Y;
  vy = 0;
  onGround = true;
  dino.style.bottom = dinoY + "px";

  // clear sprites
  obstacles.forEach(o => o.el.remove());
  coins.forEach(c => c.el.remove());
  obstacles = [];
  coins = [];

  // timers
  lastTime = 0;
  nextObstacleAt = 0;
  nextCoinAt = 0;

  // reset question
  qIndex = {1:0,2:0,3:0};
  selectedOption = null;
  currentQuestion = null;
  coinRef = null;
  closeQuestion();

  updateHUD();
}

// ====== PHYSICS ======
function jump(){
  if (!isRunning || pausedQuestion) return;
  if (!onGround) return;
  onGround = false;
  vy = JUMP_POWER;
}

document.addEventListener("keydown", (e)=>{
  if (e.code === "Space") jump();
});

// ====== SPRITES ======
function createSprite(className){
  const el = document.createElement("div");
  el.className = `sprite ${className}`;
  game.appendChild(el);
  return el;
}

function spawnObstacle(now){
  const el = createSprite("obstacle");
  const obj = {
    el,
    x: game.clientWidth + 50,
    y: GROUND_Y,
    speed: SPEED_BASE + world * 0.6
  };
  el.style.left = obj.x + "px";
  el.style.bottom = obj.y + "px";
  obstacles.push(obj);

  nextObstacleAt = now + rand(900, 1400);
}

function spawnCoin(now){
  const el = createSprite("coin");
  const obj = {
    el,
    x: game.clientWidth + 50,
    y: rand(GROUND_Y + 80, GROUND_Y + 140),
    speed: SPEED_BASE + world * 0.6
  };
  el.style.left = obj.x + "px";
  el.style.bottom = obj.y + "px";
  coins.push(obj);

  nextCoinAt = now + rand(1200, 1900);
}

function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function hit(a,b){
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

// ====== QUESTION MODAL ======
function openQuestion(){
  // ambil soalan seterusnya
  const list = QUESTIONS[world] || [];
  if (list.length === 0) {
    alert("Tiada soalan untuk world ni lagi.");
    pausedQuestion = false;
    return;
  }

  const idx = qIndex[world] % list.length;
  currentQuestion = list[idx];
  qIndex[world]++;

  pausedQuestion = true;
  selectedOption = null;

  // kalau modal tak wujud, fallback alert je
  if (!modal || !qText || !qOptions || !btnSubmit) {
    const ans = prompt(currentQuestion.q + "\n\n1) " + currentQuestion.a[0] + "\n2) " + currentQuestion.a[1] + "\n3) " + currentQuestion.a[2] + "\n4) " + currentQuestion.a[3]);
    // simple marking (optional)
    return;
  }

  if (qWorldTag) qWorldTag.textContent = `World ${world}`;
  qText.textContent = currentQuestion.q;

  qOptions.innerHTML = "";
  currentQuestion.a.forEach((txt, i)=>{
    const opt = document.createElement("label");
    opt.className = "opt";
    opt.innerHTML = `<input type="radio" name="ans" value="${i}"><div>${txt}</div>`;
    opt.addEventListener("click", ()=>{
      selectedOption = i;
      btnSubmit.disabled = false;
      [...qOptions.querySelectorAll(".opt")].forEach(o=>o.classList.remove("selected"));
      opt.classList.add("selected");
    });
    qOptions.appendChild(opt);
  });

  if (qFeedback){
    qFeedback.textContent = "";
    qFeedback.className = "feedback";
  }

  btnSubmit.disabled = true;
  modal.classList.remove("hidden");
}

function closeQuestion(){
  if (!modal) return;
  modal.classList.add("hidden");
  pausedQuestion = false;
  currentQuestion = null;
  selectedOption = null;
  coinRef = null;
}

if (btnSubmit){
  btnSubmit.addEventListener("click", ()=>{
    if (!currentQuestion || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.c;
    if (correct){
      score += 10;
      if (qFeedback){
        qFeedback.textContent = "Betul ✅ +10";
        qFeedback.className = "feedback good";
      }
    } else {
      lives = Math.max(0, lives - 1);
      if (qFeedback){
        qFeedback.textContent = "Salah ❌ -1 nyawa";
        qFeedback.className = "feedback bad";
      }
    }
    updateHUD();

    // buang coin yang trigger tadi (elak ulang)
    if (coinRef){
      coinRef.el.remove();
      coins = coins.filter(c => c !== coinRef);
    }

    setTimeout(()=>{
      closeQuestion();

      if (lives <= 0){
        isRunning = false;
        alert("Game Over 😭");
      }
    }, 500);
  });
}

// ====== LOOP ======
function loop(now){
  requestAnimationFrame(loop);

  if (!isRunning) {
    lastTime = now;
    return;
  }

  const dt = Math.min(40, now - lastTime);
  lastTime = now;

  // spawn schedule
  if (nextObstacleAt === 0) nextObstacleAt = now + 900;
  if (nextCoinAt === 0) nextCoinAt = now + 700;

  if (!pausedQuestion){
    if (now >= nextObstacleAt) spawnObstacle(now);
    if (now >= nextCoinAt) spawnCoin(now);
  }

  // dino physics
  if (!pausedQuestion){
    if (!onGround){
      vy -= GRAVITY;
      dinoY += vy;

      if (dinoY <= GROUND_Y){
        dinoY = GROUND_Y;
        vy = 0;
        onGround = true;
      }
      dino.style.bottom = dinoY + "px";
    }
  }

  // move sprites
  const speedFactor = pausedQuestion ? 0 : 1;

  obstacles.forEach((o, idx)=>{
    o.x -= o.speed * speedFactor;
    o.el.style.left = o.x + "px";

    // collision
    if (!pausedQuestion && hit(dino, o.el)){
      o.el.remove();
      obstacles.splice(idx,1);
      lives = Math.max(0, lives - 1);
      updateHUD();
      if (lives <= 0){
        isRunning = false;
        alert("Game Over 😭");
      }
    }
  });

  coins.forEach((c, idx)=>{
    c.x -= c.speed * speedFactor;
    c.el.style.left = c.x + "px";

    if (!pausedQuestion && hit(dino, c.el)){
      // set ref coin & trigger question
      coinRef = c;
      openQuestion();
    }
  });

  // cleanup out of screen
  obstacles = obstacles.filter(o => o.x > -120);
  coins = coins.filter(c => c.x > -120);

  // “run feel” (bagi dino nampak bergerak walau sprite static)
  if (!pausedQuestion){
    const bob = Math.sin(now / 120) * 1.2;
    dino.style.transform = `translateY(${bob}px)`;
  } else {
    dino.style.transform = `translateY(0px)`;
  }
}

// ====== BUTTONS ======
btnStart?.addEventListener("click", ()=>{
  resetGame();
  isRunning = true;
  updateHUD();
});

btnReset?.addEventListener("click", ()=>{
  resetGame();
});

// ====== INIT ======
setDino("green");
bindDinoButtons();
resetGame();
requestAnimationFrame(loop);
