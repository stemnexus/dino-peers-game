/*************************************************
 * DINO PEERS GAME (robust)
 * Works with:
 * - inline onclick="startGame()" "resetGame()" "selectDino(n)" "answer(i)"
 * - OR buttons with ids btnStart/btnReset + dino buttons by text
 *************************************************/

// --------- helpers ----------
const $ = (id) => document.getElementById(id);
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;

// --------- DOM fallback detect ----------
function getGameFrame(){
  return $("gameFrame") || $("game") || document.querySelector(".game-frame") || document.body;
}

function ensureElement(id, className, parent){
  let el = $(id);
  if(!el){
    el = document.createElement("div");
    el.id = id;
    if(className) el.className = className;
    parent.appendChild(el);
  }
  return el;
}

// --------- STATE ----------
let running = false;
let paused = false;

let world = 1;
let score = 0;
let lives = 3;

let dinoX = 80;
let dinoY = 60;           // bottom offset in px
let vy = 0;
let onGround = true;

let speed = 4.2;
let lastT = 0;

let coinX = 900;
let coinY = 160;
let coinActive = false;

let obstacleX = 1100;
let obstacleActive = false;

// --------- QUESTION BANK (sample dulu) ----------
const QUESTIONS = {
  1: [
    { q:"Penyalahgunaan bahan boleh menyebabkan…", a:["Ketagihan","Lebih fokus","Lebih sihat","Tidur lena"], c:0 },
    { q:"Jika rakan ajak cuba bahan terlarang, tindakan terbaik ialah…", a:["Tolak & jauhi","Cuba sikit","Diam saja","Ikut kawan"], c:0 },
  ],
  2: [
    { q:"Stres ialah…", a:["Tekanan mental/emosi","Penyakit gigi","Kecederaan","Masalah mata"], c:0 },
    { q:"Cara urus stres yang betul…", a:["Rehat & sokongan","Ponteng sekolah","Ambil bahan","Pendam sampai meletup"], c:0 },
  ],
  3: [
    { q:"Komunikasi keluarga penting untuk…", a:["Elak salah faham","Tambah konflik","Senyap selamanya","Membuli"], c:0 },
    { q:"Peranan remaja dalam keluarga ialah…", a:["Hormati & bantu","Tak peduli","Lawannya selalu","Buat hal sendiri"], c:0 },
  ],
};
let qIdx = {1:0,2:0,3:0};
let currentQ = null;

// --------- ELEMENTS ----------
const frame = getGameFrame();

// dino / coin / obstacle
const dino = ensureElement("dino", "dino", frame);
const coin = ensureElement("coin", "coin", frame);
const obstacle = ensureElement("obstacle", "obstacle", frame);

// question overlay (support 2 jenis: modal overlay OR simple)
const qBox = ensureElement("questionBox", "question-box", document.body);
let qCard = qBox.querySelector(".question-card");
if(!qCard){
  qCard = document.createElement("div");
  qCard.className = "question-card";
  qBox.appendChild(qCard);
}
let qText = qCard.querySelector("#questionText");
if(!qText){
  qText = document.createElement("h3");
  qText.id = "questionText";
  qCard.appendChild(qText);
}

// answers container
let ansWrap = qCard.querySelector(".answersWrap");
if(!ansWrap){
  ansWrap = document.createElement("div");
  ansWrap.className = "answersWrap";
  qCard.appendChild(ansWrap);
}

// status HUD (kalau ada)
const hudWorld = $("hudWorld");
const hudScore = $("hudScore");
const hudLives = $("hudLives");

// input world (kalau ada)
const selWorld = $("world") || $("selWorld");

// --------- SPRITE IMAGE (single png) ----------
dino.style.backgroundImage = `url("assets/dino.png")`;
dino.style.left = dinoX + "px";
dino.style.bottom = dinoY + "px";

// hide coin/obstacle initially
coin.style.display = "none";
obstacle.style.display = "none";

// --------- DINO COLOR via filter (sebab 1 file je) ----------
const dinoFilters = [
  "none",                                 // hijau (original)
  "hue-rotate(120deg) saturate(1.2)",     // merah-ish
  "hue-rotate(210deg) saturate(1.3)",     // biru-ish
  "hue-rotate(40deg) saturate(1.4)"       // oren-ish
];
let dinoPick = 0;

// --------- UI update ----------
function updateHUD(){
  if (hudWorld) hudWorld.textContent = `World: ${world}`;
  if (hudScore) hudScore.textContent = `Score: ${score}`;
  if (hudLives) hudLives.textContent = `Lives: ${lives}`;
}

// --------- collision ----------
function rect(el){
  const r = el.getBoundingClientRect();
  return {l:r.left,t:r.top,r:r.right,b:r.bottom};
}
function hit(a,b){
  const A = rect(a), B = rect(b);
  return !(A.r < B.l || A.l > B.r || A.b < B.t || A.t > B.b);
}

// --------- spawn ----------
function spawnCoin(){
  const W = frame.clientWidth || 900;
  coinX = W + rand(60, 200);
  coinY = rand(120, 220);
  coin.style.left = coinX + "px";
  coin.style.bottom = coinY + "px";
  coin.style.display = "block";
  coinActive = true;
}

function spawnObstacle(){
  const W = frame.clientWidth || 900;
  obstacleX = W + rand(120, 240);
  obstacle.style.left = obstacleX + "px";
  obstacle.style.bottom = "60px";
  obstacle.style.display = "block";
  obstacleActive = true;
}

// --------- question ----------
function openQuestion(){
  paused = true;
  const list = QUESTIONS[world] || [];
  if(list.length === 0){
    alert("Soalan untuk world ni belum dimasukkan.");
    paused = false;
    return;
  }
  const idx = qIdx[world] % list.length;
  currentQ = list[idx];
  qIdx[world]++;

  // build UI
  qText.textContent = currentQ.q;
  ansWrap.innerHTML = "";
  currentQ.a.forEach((txt,i)=>{
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = txt;
    btn.onclick = ()=> answer(i);
    ansWrap.appendChild(btn);
  });

  qBox.style.display = "flex";
}

function closeQuestion(){
  qBox.style.display = "none";
  paused = false;
  currentQ = null;
}

// --------- GLOBAL FUNCTIONS (penting utk onclick) ----------
window.selectDino = function(n){
  dinoPick = clamp(Number(n||0), 0, 3);
  dino.style.filter = dinoFilters[dinoPick];

  // set active button UI kalau ada
  document.querySelectorAll(".btn-dino").forEach(b=>b.classList.remove("active"));
  const map = ["Hijau","Merah","Biru","Oren"];
  const btn = [...document.querySelectorAll("button")].find(x => (x.textContent||"").trim() === map[dinoPick]);
  if(btn) btn.classList.add("active");
};

window.startGame = function(){
  // ambil world
  world = Number(selWorld?.value || 1);
  speed = 4.2 + (world-1)*0.6;

  // reset basic
  score = 0;
  lives = 3;
  running = true;
  paused = false;

  // reset positions
  dinoX = 80;
  dinoY = 60;
  vy = 0;
  onGround = true;

  coinActive = false;
  obstacleActive = false;
  coin.style.display = "none";
  obstacle.style.display = "none";

  updateHUD();
};

window.resetGame = function(){
  running = false;
  paused = false;
  score = 0;
  lives = 3;
  dinoY = 60;
  vy = 0;
  onGround = true;
  coinActive = false;
  obstacleActive = false;
  coin.style.display = "none";
  obstacle.style.display = "none";
  closeQuestion();
  updateHUD();
};

window.answer = function(i){
  if(!currentQ) return;

  const correct = (i === currentQ.c);
  if(correct){
    score += 10;
  } else {
    lives = Math.max(0, lives - 1);
  }
  updateHUD();
  closeQuestion();

  // after answer, remove coin
  coinActive = false;
  coin.style.display = "none";

  if(lives <= 0){
    running = false;
    alert("Game Over 😭");
  }
};

// space jump
document.addEventListener("keydown",(e)=>{
  if(e.code !== "Space") return;
  if(!running || paused) return;
  if(!onGround) return;
  onGround = false;
  vy = 13;
});

// --------- ALSO SUPPORT old buttons id ----------
const btnStart = $("btnStart");
if(btnStart) btnStart.onclick = ()=> window.startGame();
const btnReset = $("btnReset");
if(btnReset) btnReset.onclick = ()=> window.resetGame();

// --------- MAIN LOOP ----------
function loop(t){
  requestAnimationFrame(loop);
  const dt = Math.min(35, t - lastT);
  lastT = t;

  if(!running) return;
  if(paused) return;

  // physics
  if(!onGround){
    vy -= 0.65;
    dinoY += vy;
    if(dinoY <= 60){
      dinoY = 60;
      vy = 0;
      onGround = true;
    }
  }
  dino.style.bottom = dinoY + "px";

  // spawn logic
  if(!coinActive && Math.random() < 0.015) spawnCoin();
  if(!obstacleActive && Math.random() < 0.010) spawnObstacle();

  // move coin
  if(coinActive){
    coinX -= speed;
    coin.style.left = coinX + "px";
    if(coinX < -80){
      coinActive = false;
      coin.style.display = "none";
    }
    // pickup
    if(hit(dino, coin)){
      openQuestion();
    }
  }

  // move obstacle
  if(obstacleActive){
    obstacleX -= speed;
    obstacle.style.left = obstacleX + "px";
    if(obstacleX < -80){
      obstacleActive = false;
      obstacle.style.display = "none";
    }
    if(hit(dino, obstacle)){
      obstacleActive = false;
      obstacle.style.display = "none";
      lives = Math.max(0, lives - 1);
      updateHUD();
      if(lives <= 0){
        running = false;
        alert("Game Over 😭");
      }
    }
  }
}

// init
window.selectDino(0);
updateHUD();
requestAnimationFrame(loop);
