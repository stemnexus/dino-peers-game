// ===============================
// CONFIG
// ===============================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnc7GGOGRatTpGASWmLVbv79EP7gj0WLIx2wmXqZH1a0JJhf_sU1MmCe8Kvv2ObRzo/exec";

const GAME_W = 900;        // logical width (not actual CSS width)
const GROUND_Y = 20;       // bottom offset from game container
const DINO_X = 70;

const OBSTACLE_MIN_GAP = 800; // ms min gap
const OBSTACLE_MAX_GAP = 1400;

const COIN_MIN_GAP = 1800;
const COIN_MAX_GAP = 2600;

const JUMP_V = 12;
const GRAVITY = 0.7;

const MAX_LIVES = 3;

// ===============================
// QUESTIONS (10 each world)
// ===============================
const QUESTIONS = {
  1: [
    { q:"Apakah maksud penyalahgunaan bahan?", a:["Menggunakan bahan terlarang secara salah","Makan berlebihan setiap hari","Tidak bersenam","Tidur lewat malam"], c:0 },
    { q:"Satu contoh bahan yang disalahguna ialah…", a:["Arak","Air kosong","Susu","Buah-buahan"], c:0 },
    { q:"Penyalahgunaan bahan boleh menyebabkan…", a:["Ketagihan","Bertenaga sepanjang masa","Fokus bertambah","Tidur berkualiti"], c:0 },
    { q:"Kesan pada otak boleh jadi…", a:["Fikiran bercelaru","Ingatan tajam","Idea lebih stabil","Emosi tenang"], c:0 },
    { q:"Kesan sosial yang mungkin berlaku…", a:["Disisih keluarga/masyarakat","Semua hormat","Kawan bertambah","Hubungan makin rapat"], c:0 },
    { q:"Mengapa salah dari segi undang-undang?", a:["Dilarang oleh negara","Sebab mahal","Sebab popular","Sebab susah didapati"], c:0 },
    { q:"Risiko kepada diri termasuk…", a:["Masalah kesihatan","Lebih sihat","Tidak pernah sakit","Otot makin kuat"], c:0 },
    { q:"Jika rakan ajak cuba bahan terlarang, tindakan terbaik ialah…", a:["Tolak dan jauhi","Cuba sikit","Diam saja","Ikut kawan"], c:0 },
    { q:"Faedah tidak terlibat ialah…", a:["Prestasi akademik lebih baik","Lebih stres","Selalu marah","Hubungan renggang"], c:0 },
    { q:"Kemahiran psikososial penting untuk…", a:["Membuat keputusan tepat","Menunjuk hebat","Melawan cikgu","Bergaduh"], c:0 },
  ],
  2: [
    { q:"Stres ialah…", a:["Tekanan mental/emosi","Penyakit kulit","Kecederaan sukan","Masalah gigi"], c:0 },
    { q:"Contoh stres di sekolah ialah…", a:["Tekanan peperiksaan","Makan tengah hari","Main bola","Baca komik"], c:0 },
    { q:"Konflik bermaksud…", a:["Perselisihan/pertelingkahan","Tidur nyenyak","Bergurau","Bersenam"], c:0 },
    { q:"Salah satu kesan stres pada diri ialah…", a:["Sukar fokus","Fokus meningkat","Tenaga bertambah","Emosi stabil"], c:0 },
    { q:"Cara menangani stres yang betul…", a:["Berehat secukupnya","Ponteng sekolah","Cederakan diri","Ambil ubat berlebihan"], c:0 },
    { q:"Cara menangani konflik yang betul…", a:["Berbincang dengan ibu bapa/guru/kaunselor","Jerit dan maki","Pukul orang","Lari dari rumah"], c:0 },
    { q:"Stres boleh menyebabkan…", a:["Emosi tidak stabil","Lebih ceria sepanjang masa","Tidak pernah risau","Tidur sentiasa lena"], c:0 },
    { q:"Sikap yang membantu urus konflik ialah…", a:["Toleransi","Dendam","Cemburu","Ejek"], c:0 },
    { q:"Cara salah urus stres ialah…", a:["Terlibat penyalahgunaan bahan","Berhobi","Bersukan","Berbincang"], c:0 },
    { q:"Bila stres, tindakan baik ialah…", a:["Dapatkan sokongan orang dipercayai","Pendam sampai meletup","Balas dendam","Hina diri"], c:0 },
  ],
  3: [
    { q:"Keluarga penting kerana…", a:["Memberi sokongan dan perlindungan","Menyusahkan hidup","Buat kita stres saja","Halang cita-cita"], c:0 },
    { q:"Komunikasi dalam keluarga penting untuk…", a:["Elak salah faham","Tambah konflik","Senyap selamanya","Membuli ahli keluarga"], c:0 },
    { q:"Salah satu peranan ibu bapa ialah…", a:["Bimbing dan sayang","Abaikan anak","Asyik marah tanpa sebab","Biarkan anak sendirian"], c:0 },
    { q:"Konflik keluarga boleh menyebabkan anak…", a:["Stres/sedih","Lebih fokus selalu","Tiada emosi","Sentiasa gembira"], c:0 },
    { q:"Cara kurangkan stres dalam keluarga…", a:["Berbincang secara terbuka","Sindiran","Jerit-jerit","Lari masalah"], c:0 },
    { q:"Sikap bertolak ansur penting untuk…", a:["Keharmonian keluarga","Bina dendam","Cari salah","Bergaduh"], c:0 },
    { q:"Hubungan keluarga renggang biasanya kerana…", a:["Kurang komunikasi mesra","Selalu berbincang","Saling membantu","Hormat-menghormati"], c:0 },
    { q:"Tingkah laku positif dibentuk melalui…", a:["Sokongan keluarga","Tekanan berterusan","Ejekan","Pergaduhan"], c:0 },
    { q:"Peranan remaja dalam keluarga ialah…", a:["Hormati & bantu ahli keluarga","Buat hal sendiri","Tak peduli siapa-siapa","Lawannya selalu"], c:0 },
    { q:"Keluarga harmoni membantu…", a:["Sahsiah positif","Ketagihan","Konflik berpanjangan","Stres melampau"], c:0 },
  ]
};

// ===============================
// DOM
// ===============================
const game = document.getElementById("game");
const dino = document.getElementById("dino");

const hudWorld = document.getElementById("hudWorld");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");

const inpNama = document.getElementById("inpNama");
const inpKelas = document.getElementById("inpKelas");
const selWorld = document.getElementById("selWorld");
const btnStart = document.getElementById("btnStart");
const btnReset = document.getElementById("btnReset");

const modal = document.getElementById("modal");
const qTitle = document.getElementById("qTitle");
const qWorldTag = document.getElementById("qWorldTag");
const qText = document.getElementById("qText");
const qOptions = document.getElementById("qOptions");
const qFeedback = document.getElementById("qFeedback");
const btnSubmit = document.getElementById("btnSubmit");

const resultModal = document.getElementById("result");
const resultText = document.getElementById("resultText");
const btnCloseResult = document.getElementById("btnCloseResult");

// ===============================
// GAME STATE
// ===============================
let world = 1;
let score = 0;
let lives = MAX_LIVES;

let isRunning = false;
let isPausedForQuestion = false;

let dinoY = GROUND_Y;
let dinoVY = 0;
let onGround = true;

let obstacles = [];
let coins = [];

let obstacleSpawnAt = 0;
let coinSpawnAt = 0;

let lastTime = 0;

// per-world marks
let worldScore = {1:0, 2:0, 3:0};
let askedIndex = {1:0, 2:0, 3:0};

// question temp
let currentQuestion = null;
let selectedOption = null;
let coinToRemove = null;

// ===============================
// HELPERS
// ===============================
function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function setHUD(){
  hudWorld.textContent = `World: ${world}`;
  hudScore.textContent = `Score: ${score}`;
  hudLives.textContent = `Lives: ${lives}`;
}

function resetState(){
  score = 0;
  lives = MAX_LIVES;

  obstacles.forEach(o => o.el.remove());
  coins.forEach(c => c.el.remove());
  obstacles = [];
  coins = [];

  worldScore = {1:0, 2:0, 3:0};
  askedIndex = {1:0, 2:0, 3:0};

  dinoY = GROUND_Y;
  dinoVY = 0;
  onGround = true;
  dino.style.bottom = `${dinoY}px`;

  lastTime = 0;
  obstacleSpawnAt = 0;
  coinSpawnAt = 0;

  isPausedForQuestion = false;
  closeQuestion();
  closeResult();

  setHUD();
}

function getGameRect(){
  return game.getBoundingClientRect();
}

function rectsHit(a, b){
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function createSprite(className){
  const el = document.createElement("div");
  el.className = `sprite ${className}`;
  game.appendChild(el);
  return el;
}

function spawnObstacle(now){
  const el = createSprite("obstacle");
  const obj = { el, x: GAME_W + 40, w: 26, h: 52, y: GROUND_Y };
  el.style.left = `${obj.x}px`;
  el.style.bottom = `${obj.y}px`;
  obstacles.push(obj);

  obstacleSpawnAt = now + rand(OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
}

function spawnCoin(now){
  const el = createSprite("coin");
  const y = rand(GROUND_Y + 70, GROUND_Y + 140);
  const obj = { el, x: GAME_W + 40, w: 22, h: 22, y };
  el.style.left = `${obj.x}px`;
  el.style.bottom = `${obj.y}px`;
  coins.push(obj);

  coinSpawnAt = now + rand(COIN_MIN_GAP, COIN_MAX_GAP);
}

function jump(){
  if (!isRunning || isPausedForQuestion) return;
  if (!onGround) return;
  onGround = false;
  dinoVY = JUMP_V;
}

function gameOver(){
  isRunning = false;
  showResult(true);
}

function nextWorld(){
  if (world < 3){
    world += 1;
    setHUD();
  }
}

// ===============================
// QUESTION FLOW
// ===============================
function openQuestion(qObj){
  isPausedForQuestion = true;
  currentQuestion = qObj;
  selectedOption = null;
  btnSubmit.disabled = true;
  qFeedback.textContent = "";
  qFeedback.className = "feedback";

  qTitle.textContent = "Jawab untuk dapat tenaga!";
  qWorldTag.textContent = `World ${world}`;
  qText.textContent = qObj.q;

  qOptions.innerHTML = "";
  qObj.a.forEach((txt, idx) => {
    const opt = document.createElement("label");
    opt.className = "opt";
    opt.innerHTML = `
      <input type="radio" name="ans" value="${idx}">
      <div>${txt}</div>
    `;
    opt.addEventListener("click", () => {
      selectedOption = idx;
      btnSubmit.disabled = false;
      [...qOptions.querySelectorAll(".opt")].forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
    qOptions.appendChild(opt);
  });

  modal.classList.remove("hidden");
}

function closeQuestion(){
  modal.classList.add("hidden");
  currentQuestion = null;
  selectedOption = null;
  coinToRemove = null;
  isPausedForQuestion = false;
}

btnSubmit.addEventListener("click", () => {
  if (currentQuestion == null || selectedOption == null) return;

  const correct = (selectedOption === currentQuestion.c);

  if (correct){
    qFeedback.textContent = "Betul ✅ +10 markah";
    qFeedback.className = "feedback good";
    score += 10;
    worldScore[world] += 10;
  } else {
    qFeedback.textContent = "Salah ❌ -1 nyawa";
    qFeedback.className = "feedback bad";
    lives -= 1;
  }

  setHUD();

  // remove coin (prevent re-trigger)
  if (coinToRemove){
    coinToRemove.el.remove();
    coins = coins.filter(c => c !== coinToRemove);
  }

  // auto close after short delay
  setTimeout(() => {
    closeQuestion();

    if (lives <= 0){
      gameOver();
      return;
    }

    // if already answered enough in this world, allow next world
    if (askedIndex[world] >= 10){
      nextWorld();
    }
  }, 500);
});

// ===============================
// RESULT + SUBMIT TO SHEETS
// ===============================
function kiraTP(percent){
  if (percent < 40) return "TP1";
  if (percent < 60) return "TP2";
  if (percent < 75) return "TP3";
  if (percent < 85) return "TP4";
  if (percent < 95) return "TP5";
  return "TP6";
}

function showResult(isGameOver){
  // compute percentage: max 30 soalan x 10 = 300
  const max = 300;
  const total = worldScore[1] + worldScore[2] + worldScore[3];
  const percent = Math.round((total / max) * 100);
  const tp = kiraTP(percent);

  const nama = (inpNama.value || "").trim() || "Tanpa Nama";
  const kelas = (inpKelas.value || "").trim() || "Tanpa Kelas";

  resultText.innerHTML = `
    <b>${isGameOver ? "Game Over" : "Tamat!"}</b><br><br>
    Nama: <b>${nama}</b><br>
    Kelas: <b>${kelas}</b><br><br>
    World 1: <b>${worldScore[1]}</b><br>
    World 2: <b>${worldScore[2]}</b><br>
    World 3: <b>${worldScore[3]}</b><br><br>
    Skor (%): <b>${percent}</b><br>
    Tahap Penguasaan: <b>${tp}</b>
  `;

  resultModal.classList.remove("hidden");

  // send to Sheets (best effort)
  hantarKeSheets(nama, kelas, worldScore[1], worldScore[2], worldScore[3], percent, tp);
}

function closeResult(){
  resultModal.classList.add("hidden");
}

btnCloseResult.addEventListener("click", () => {
  closeResult();
});

function hantarKeSheets(nama, kelas, w1, w2, w3, percent, tp){
  const payload = { nama, kelas, world1: w1, world2: w2, world3: w3, skor: percent, tp };

  // no-cors so browser won't block; apps script will still receive
  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(()=>{});
}

// ===============================
// LOOP
// ===============================
function loop(now){
  if (!isRunning){
    lastTime = now;
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(32, now - lastTime);
  lastTime = now;

  // spawn
  if (obstacleSpawnAt === 0) obstacleSpawnAt = now + 600;
  if (coinSpawnAt === 0) coinSpawnAt = now + 1200;

  if (!isPausedForQuestion){
    if (now >= obstacleSpawnAt) spawnObstacle(now);
    if (now >= coinSpawnAt) spawnCoin(now);
  }

  // dino physics
  if (!isPausedForQuestion){
    if (!onGround){
      dinoVY -= GRAVITY;
      dinoY += dinoVY;
      if (dinoY <= GROUND_Y){
        dinoY = GROUND_Y;
        dinoVY = 0;
        onGround = true;
      }
      dino.style.bottom = `${dinoY}px`;
    }
  }

  // move sprites
  const speed = isPausedForQuestion ? 0 : (5 + world); // world 1 slow, world 3 faster
  obstacles.forEach(o => {
    o.x -= speed;
    o.el.style.left = `${o.x}px`;
  });
  coins.forEach(c => {
    c.x -= speed;
    c.el.style.left = `${c.x}px`;
  });

  // cleanup
  obstacles = obstacles.filter(o => o.x > -80);
  coins = coins.filter(c => c.x > -80);

  // collisions
  if (!isPausedForQuestion){
    const gRect = getGameRect();
    const dRect = dino.getBoundingClientRect();

    // obstacle hit -> lose life
    for (const o of obstacles){
      const oRect = o.el.getBoundingClientRect();
      if (rectsHit(dRect, oRect)){
        // remove obstacle to avoid repeated hit
        o.el.remove();
        obstacles = obstacles.filter(x => x !== o);

        lives -= 1;
        setHUD();

        if (lives <= 0){
          gameOver();
          break;
        }
      }
    }

    // coin hit -> question
    for (const c of coins){
      const cRect = c.el.getBoundingClientRect();
      if (rectsHit(dRect, cRect)){
        coinToRemove = c;

        // pick next question
        const idx = askedIndex[world];
        if (idx >= 10){
          // if already complete, just give score and remove coin
          score += 2;
          worldScore[world] += 2;
          setHUD();
          c.el.remove();
          coins = coins.filter(x => x !== c);

          nextWorld();
        } else {
          const qObj = QUESTIONS[world][idx];
          askedIndex[world] += 1;
          openQuestion(qObj);
        }
        break;
      }
    }
  }

  // end condition: all worlds done + all questions answered
  const allDone = askedIndex[1] >= 10 && askedIndex[2] >= 10 && askedIndex[3] >= 10;
  if (isRunning && allDone){
    isRunning = false;
    showResult(false);
  }

  requestAnimationFrame(loop);
}

// ===============================
// EVENTS
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

btnStart.addEventListener("click", () => {
  if (isRunning) return;
  world = Number(selWorld.value || "1");
  setHUD();
  isRunning = true;
});

btnReset.addEventListener("click", () => {
  isRunning = false;
  resetState();
});

function closeAllModalsIfClickOutside(e){
  if (!modal.classList.contains("hidden")){
    const card = modal.querySelector(".modalCard");
    if (card && !card.contains(e.target)) { /* do nothing: force answer */ }
  }
}
document.addEventListener("click", closeAllModalsIfClickOutside);

// init
resetState();
requestAnimationFrame(loop);

