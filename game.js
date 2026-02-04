/*************************************************
 * DINO PEERS GAME - game.js
 * Sprite Dino version (assets/dinos.png)
 *************************************************/

// ================== CONFIG ==================
const GRAVITY = 0.6;
const JUMP_POWER = 12;
const GROUND_Y = 20;
const GAME_SPEED = 4;

// ================== DOM ==================
const game = document.getElementById("game");
const dino = document.getElementById("dino");
const btnStart = document.getElementById("btnStart");
const btnReset = document.getElementById("btnReset");
const selWorld = document.getElementById("selWorld");

const hudWorld = document.getElementById("hudWorld");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");

// ================== STATE ==================
let dinoY = GROUND_Y;
let velocityY = 0;
let onGround = true;

let score = 0;
let lives = 3;
let world = 1;

let isRunning = false;
let obstacles = [];
let coins = [];

// ================== DINO SPRITE ==================
let selectedDino = "green"; // default

function setDino(type) {
  dino.className = "dino"; // reset
  dino.classList.add(`dino-${type}`);
  selectedDino = type;
}

// ================== INIT ==================
function initGame() {
  score = 0;
  lives = 3;
  world = Number(selWorld.value);
  dinoY = GROUND_Y;
  velocityY = 0;
  onGround = true;

  obstacles.forEach(o => o.remove());
  coins.forEach(c => c.remove());
  obstacles = [];
  coins = [];

  updateHUD();
  dino.style.bottom = dinoY + "px";
}

// ================== HUD ==================
function updateHUD() {
  hudWorld.textContent = `World: ${world}`;
  hudScore.textContent = `Score: ${score}`;
  hudLives.textContent = `Lives: ${lives}`;
}

// ================== JUMP ==================
function jump() {
  if (!isRunning) return;
  if (!onGround) return;

  velocityY = JUMP_POWER;
  onGround = false;
}

// ================== OBSTACLE ==================
function spawnObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle sprite";
  obs.style.left = "100%";
  obs.style.bottom = GROUND_Y + "px";
  game.appendChild(obs);
  obstacles.push(obs);
}

// ================== COIN ==================
function spawnCoin() {
  const coin = document.createElement("div");
  coin.className = "coin sprite";
  coin.style.left = "100%";
  coin.style.bottom = (GROUND_Y + 90) + "px";
  game.appendChild(coin);
  coins.push(coin);
}

// ================== COLLISION ==================
function isCollide(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

// ================== GAME LOOP ==================
function gameLoop() {
  if (!isRunning) return;

  // Gravity
  if (!onGround) {
    velocityY -= GRAVITY;
    dinoY += velocityY;

    if (dinoY <= GROUND_Y) {
      dinoY = GROUND_Y;
      velocityY = 0;
      onGround = true;
    }
    dino.style.bottom = dinoY + "px";
  }

  // Move obstacles
  obstacles.forEach((obs, i) => {
    obs.style.left = obs.offsetLeft - GAME_SPEED + "px";

    if (isCollide(dino, obs)) {
      obs.remove();
      obstacles.splice(i, 1);
      lives--;
      updateHUD();

      if (lives <= 0) {
        isRunning = false;
        alert("GAME OVER");
      }
    }
  });

  // Move coins
  coins.forEach((coin, i) => {
    coin.style.left = coin.offsetLeft - GAME_SPEED + "px";

    if (isCollide(dino, coin)) {
      coin.remove();
      coins.splice(i, 1);
      score += 10;
      updateHUD();

      alert("Jawab soalan PEERS! (placeholder)");
    }
  });

  requestAnimationFrame(gameLoop);
}

// ================== CONTROLS ==================
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

btnStart.addEventListener("click", () => {
  initGame();
  isRunning = true;
  gameLoop();
});

btnReset.addEventListener("click", () => {
  isRunning = false;
  initGame();
});

// ================== AUTO SPAWN ==================
setInterval(() => {
  if (isRunning) spawnObstacle();
}, 2000);

setInterval(() => {
  if (isRunning) spawnCoin();
}, 3000);

// ================== DEFAULT DINO ==================
setDino("green");
updateHUD();
