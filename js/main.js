import { Player } from "./player.js";
import { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { distanceBetweenTwoPoints } from "./utilities.js";

const canvas = document.querySelector('canvas'); // получаю элемент canvas
const context = canvas.getContext('2d'); // ссылка на контекст для рисования в canvas
canvas.width = document.documentElement.clientWidth; // создаю размер canvas чтоб он был на всю ширину экрана
canvas.height = document.documentElement.clientHeight; // создаю размер canvas чтоб он был на всю высоту экрана

const wastedElement = document.querySelector('.wasted');
const scoreElement = document.querySelector('#score');

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let spawnIntervalId;
let countIntervalId;
let score = 0;

startGame();

function startGame() {
  init();
  animate();
  spawnEnemies();
}

function init() {
  const movementLimits = {
    minX: 0,
    maxX: canvas.width,
    minY: 0,
    maxY: canvas.height,
  };

  player = new Player(canvas.width / 2, canvas.height / 2, context, movementLimits);
  addEventListener('click', createProjectile);
}

function createProjectile(event) {
  projectiles.push(
    new Projectile(
      player.x,
      player.y,
      event.clientX,
      event.clientY,
      context,
    )
  );
}

function spawnEnemies() {
  let countOfSpawnEnemies = 1;

  countIntervalId = setInterval(() => countOfSpawnEnemies++, 30000)
  spawnIntervalId = setInterval(() => spawnCountEnemies(countOfSpawnEnemies), 1000);
  spawnCountEnemies(countOfSpawnEnemies);
}

function spawnCountEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new Enemy(canvas.width, canvas.height, context, player));
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(particle => particle.alpha > 0);
  projectiles = projectiles.filter(projectileInsideWindow);
  enemies.forEach(enemy => checkHittingEnemy(enemy));
  enemies = enemies.filter(enemy => enemy.health > 0);
  const isGameOver = enemies.some(enemy => checkHittingPlayer(enemy));

  if (isGameOver) {
    wastedElement.style.display = 'block';
    clearInterval(countIntervalId);
    clearInterval(spawnIntervalId);
    cancelAnimationFrame(animationId);
  }

  particles.forEach(particle => particle.update());
  projectiles.forEach(projectile => projectile.update());
  player.update();
  enemies.forEach(enemy => enemy.update());
}

function projectileInsideWindow(projectile) {
  return projectile.x + projectile.radius > 0 &&
    projectile.x - projectile.radius < canvas.width &&
    projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height;
}

function checkHittingPlayer(enemy) {
  const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y);
  return (distance - enemy.radius - player.radius) < 0;
}

function checkHittingEnemy(enemy) {
  projectiles.some((projectile, index) => {
    const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y);

    if (distance - enemy.radius - projectile.radius > 0) return false;

    removeProjectileByIndex(index);
    enemy.health--;

    if (enemy.health < 1) {
      increaseScore()
      enemy.createExplosion(particles);
    }

    return true;
  });
}

function removeProjectileByIndex(index) {
  projectiles.splice(index, 1);
}

function increaseScore() {
  score += 250;
  scoreElement.innerText = score;
}