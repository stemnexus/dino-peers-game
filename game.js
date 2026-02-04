const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnc7GGOGRatTpGASWmLVbv79EP7gj0WLIx2wmXqZH1a0JJhf_sU1MmCe8Kvv2ObRzo/exec";

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
const qWorldTag = document.getElementById("qWorldTag");
const qText = document.getElementById("qText");
const qOptions = document.getElementById("qOptions");
const qFeedback = document.getElementById("qFeedback");
const btnSubmit = document.getElementById("btnSubmit");

const resultModal = document.getElementById("result");
const resultText = document.getElementById("resultText");
const btnCloseResult = document.getElementById("btnCloseResult");

// ================= QUESTIONS =================
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

// ================= STATE =================
const MAX_LIVES = 3;
const GROUND = 90; // same as .ground height
const DINO_FLOOR = GROUND;

let isRunning = false;
let pausedQ = false;

let world = 1;
let score = 0;
let lives = MAX_LIVES;

let dinoY = DINO_FLOOR;
let vy = 0;
let onGround = true;

let obstacles = [];
let coins = [];

let asked = {1:0,2:0,3:0};
let worldScore = {1:0,2:0,3:0};

let lastTime = 0;
let nextObsAt = 0;
let nextCoinAt = 0;

let currentQuestion = null;
let selectedOption = null;
let coinHitRef = null;

// ================= UI: PICK DINO =================
const picks = document.querySelectorAll(".pick");
picks.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    picks.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.dino; // green/red/blue/orange
    dino.className = `dino dino-${type}`;
  });
});

// ================= HELPERS =================
const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;

function setHUD(){
  hudWorld.textContent = `World: ${world}`;
  hudScore.textContent = `Score: ${score}`;
  hudLives.textContent = `Lives: ${lives}`;
}

function resetAll(){
  // remove sprites
  obstacles.forEach(o=>o.el.remove());
  coins.forEach(c=>c.el.remove());
  obstacles = [];
  coins = [];

  world = Number(selWorld.value || "1");
  score = 0;
  lives = MAX_LIVES;

  asked = {1:0,2:0,3:0};
  worldScore = {1:0,2:0,3:0};

  dinoY = DINO_FLOOR;
  vy = 0;
  onGround = true;
  dino.style.bottom = `${dinoY}px`;

  lastTime = 0;
  nextObsAt = 0;
  nextCoinAt = 0;

  pausedQ = false;
  closeQuestion();
  closeResult();
  setHUD();
}

function createSprite(className){
  const el = document.createElement("div");
  el.className = `sprite ${className}`;
  game.appendChild(el);
  return el;
}

function spawnObstacle(now){
  const el = createSprite("obstacle");
  const obj = { el, x: game.clientWidth + 80, w: 26, h: 52, y: DINO_FLOOR };
  el.style.left = `${obj.x}px`;
  el.style.bottom = `${obj.y}px`;
  obstacles.push(obj);
  nextObsAt = now + rand(700, 1200);
}

function spawnCoin(now){
  const el = createSprite("coin");
  const y = rand(DINO_FLOOR + 90, DINO_FLOOR + 160);
  const obj = { el, x: game.clientWidth + 80, w: 28, h: 28, y };
  el.style.left = `${obj.x}px`;
  el.style.bottom = `${obj.y}px`;
  coins.push(obj);
  nextCoinAt = now + rand(1400, 2200);
}

function hitRect(a,b){
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function jump(){
  if (!isRunning || pausedQ) return;
  if (!onGround) return;
  onGround = false;
  vy = 13;
}

document.addEventListener("keydown",(e)=>{
  if(e.code==="Space") jump();
});

// ================= QUESTIONS =================
function openQuestion(qObj){
  pausedQ = true;
  currentQuestion = qObj;
  selectedOption = null;
  btnSubmit.disabled = true;

  qFeedback.textContent = "";
  qFeedback.className = "feedback";

  qWorldTag.textContent = `World ${world}`;
  qText.textContent = qObj.q;

  qOptions.innerHTML = "";
  qObj.a.forEach((txt, idx)=>{
    const opt = document.createElement("label");
    opt.className = "opt";
    opt.innerHTML = `<input type="radio" name="ans" value="${idx}"><div>${txt}</div>`;
    opt.addEventListener("click", ()=>{
      selectedOption = idx;
      btnSubmit.disabled = false;
      [...qOptions.querySelectorAll(".opt")].forEach(o=>o.classList.remove("selected"));
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
  coinHitRef = null;
  pausedQ = false;
}

btnSubmit.addEventListener("click", ()=>{
  if(!currentQuestion || selectedOption===null) return;

  const correct = (selectedOption === currentQuestion.c);
  if(correct){
    qFeedback.textContent = "Betul ✅ +10 markah";
    qFeedback.className = "feedback good";
    score += 10;
    worldScore[world] += 10;
  } else {
    qFeedback.textContent = "Salah ❌ -1 nyawa";
    qFeedback.className = "feedback bad";
    lives = Math.max(0, lives - 1);
  }
  setHUD();

  if(coinHitRef){
    coinHitRef.el.remove();
    coins = coins.filter(x=>x!==coinHitRef);
  }

  setTimeout(()=>{
    closeQuestion();
    if(lives<=0){
      isRunning = false;
      showResult(true);
      return;
    }
    // auto naik world bila cukup 10 soalan
    if(asked[world] >= 10 && world < 3){
      world++;
      setHUD();
    }
  }, 450);
});

// ================= RESULT + SHEETS =================
function kiraTP(percent){
  if (percent < 40) return "TP1";
  if (percent < 60) return "TP2";
  if (percent < 75) return "TP3";
  if (percent < 85) return "TP4";
  if (percent < 95) return "TP5";
  return "TP6";
}

function showResult(gameOver){
  const max = 300; // 30 soalan x10
  const total = worldScore[1]+worldScore[2]+worldScore[3];
  const percent = Math.round((total/max)*100);
  const tp = kiraTP(percent);

  const nama = (inpNama.value||"").trim() || "Tanpa Nama";
  const kelas = (inpKelas.value||"").trim() || "Tanpa Kelas";

  resultText.innerHTML = `
    <b>${gameOver ? "Game Over" : "Tamat!"}</b><br><br>
    Nama: <b>${nama}</b><br>
    Kelas: <b>${kelas}</b><br><br>
    World 1: <b>${worldScore[1]}</b><br>
    World 2: <b>${worldScore[2]}</b><br>
    World 3: <b>${worldScore[3]}</b><br><br>
    Skor (%): <b>${percent}</b><br>
    Tahap Penguasaan: <b>${tp}</b>
  `;
  resultModal.classList.remove("hidden");

  // send (best effort)
  fetch(APPS_SCRIPT_URL,{
    method:"POST",
    mode:"no-cors",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ nama, kelas, world1:worldScore[1], world2:worldScore[2], world3:worldScore[3], skor:percent, tp })
  }).catch(()=>{});
}

function closeResult(){ resultModal.classList.add("hidden"); }
btnCloseResult.addEventListener("click", closeResult);

// ================= LOOP =================
function loop(now){
  if(!isRunning){
    lastTime = now;
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(32, now - lastTime);
  lastTime = now;

  if(nextObsAt===0) nextObsAt = now + 800;
  if(nextCoinAt===0) nextCoinAt = now + 1200;

  if(!pausedQ){
    if(now >= nextObsAt) spawnObstacle(now);
    if(now >= nextCoinAt) spawnCoin(now);
  }

  // physics
  if(!pausedQ){
    if(!onGround){
      vy -= 0.7;
      dinoY += vy;
      if(dinoY <= DINO_FLOOR){
        dinoY = DINO_FLOOR;
        vy = 0;
        onGround = true;
      }
      dino.style.bottom = `${dinoY}px`;
    }
  }

  // move sprites
  const speed = pausedQ ? 0 : (5 + world);
  obstacles.forEach(o=>{
    o.x -= speed;
    o.el.style.left = `${o.x}px`;
  });
  coins.forEach(c=>{
    c.x -= speed;
    c.el.style.left = `${c.x}px`;
  });

  obstacles = obstacles.filter(o=>o.x>-120);
  coins = coins.filter(c=>c.x>-120);

  // collisions
  if(!pausedQ){
    const dRect = dino.getBoundingClientRect();

    // obstacle hit
    for(const o of [...obstacles]){
      const r = o.el.getBoundingClientRect();
      if(hitRect(dRect,r)){
        o.el.remove();
        obstacles = obstacles.filter(x=>x!==o);
        lives = Math.max(0, lives - 1);
        setHUD();
        if(lives<=0){
          isRunning = false;
          showResult(true);
          break;
        }
      }
    }

    // coin hit -> question
    for(const c of [...coins]){
      const r = c.el.getBoundingClientRect();
      if(hitRect(dRect,r)){
        coinHitRef = c;

        const idx = asked[world];
        if(idx >= 10){
          // kalau dah habis soalan world tu, coin bagi score kecil je
          score += 2;
          worldScore[world] += 2;
          setHUD();
          c.el.remove();
          coins = coins.filter(x=>x!==c);
        } else {
          const qObj = QUESTIONS[world][idx];
          asked[world] += 1;
          openQuestion(qObj);
        }
        break;
      }
    }
  }

  // finish condition
  const allDone = asked[1]>=10 && asked[2]>=10 && asked[3]>=10;
  if(isRunning && allDone){
    isRunning = false;
    showResult(false);
  }

  requestAnimationFrame(loop);
}

// ================= BUTTONS =================
btnStart.addEventListener("click", ()=>{
  // force input? (optional)
  world = Number(selWorld.value || "1");
  setHUD();
  isRunning = true;
});

btnReset.addEventListener("click", ()=>{
  isRunning = false;
  resetAll();
});

// init
resetAll();
requestAnimationFrame(loop);
