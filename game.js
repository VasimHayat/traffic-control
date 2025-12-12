// Traffic Control Game using Phaser 3
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      enableBody: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

const game = new Phaser.Game(config);

// Game variables
let cars;
let obstacles;
let playerCar;
let cursors;
let gameState = {
  score: 0,
  level: 1,
  carsPassed: 0,
  collisions: 0,
  isPaused: false,
  speed: 3
};

function preload() {
  // Assets loading (using shapes instead of images)
}

function create() {
  // Create player car
  playerCar = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 100, 40, 60, 0x00ff00);
  this.physics.add.existing(playerCar);
  playerCar.body.setCollideWorldBounds(true);
  playerCar.body.setBounce(0, 0);

  // Create car groups
  cars = this.physics.add.group();
  obstacles = this.physics.add.group();

  // Create initial cars
  spawnCars(this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-P', () => {
    gameState.isPaused = !gameState.isPaused;
    updatePauseMenu();
  });

  // Pause menu buttons
  document.getElementById('resume-btn').addEventListener('click', () => {
    gameState.isPaused = false;
    updatePauseMenu();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload();
  });

  // Spawn new cars periodically
  this.time.addEvent({
    delay: 2000 - (gameState.level * 100),
    callback: () => spawnCars(this),
    loop: true
  });

  // Increase difficulty
  this.time.addEvent({
    delay: 30000,
    callback: () => {
      gameState.level++;
      gameState.speed += 0.5;
      updateHUD();
    },
    loop: true
  });
}

function update() {
  if (gameState.isPaused) return;

  // Player movement
  playerCar.body.setVelocity(0, 0);
  if (cursors.left.isDown) {
    playerCar.body.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    playerCar.body.setVelocityX(300);
  }
  if (cursors.up.isDown) {
    playerCar.body.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    playerCar.body.setVelocityY(200);
  }

  // Remove cars that went off screen
  cars.children.entries.forEach(car => {
    if (car.y > game.config.height) {
      car.destroy();
      gameState.carsPassed++;
      gameState.score += 10 * gameState.level;
      updateHUD();
    }
  });

  // Collision detection
  this.physics.overlap(playerCar, cars, () => {
    gameState.collisions++;
    gameState.score = Math.max(0, gameState.score - 50);
    updateHUD();
    if (gameState.collisions >= 5) {
      endGame();
    }
  });
}

function spawnCars(scene) {
  const lanes = [100, 250, 400, 550, 700];
  const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
  const car = scene.add.rectangle(randomLane, -30, 40, 60, 0xff0000);
  scene.physics.add.existing(car);
  car.body.setVelocityY(150 + gameState.speed * 20);
  cars.add(car);
}

function updateHUD() {
  document.querySelector('#score span').textContent = gameState.score;
  document.querySelector('#level span').textContent = gameState.level;
  document.querySelector('#cars-passed span').textContent = gameState.carsPassed;
  document.querySelector('#collisions span').textContent = gameState.collisions;
}

function updatePauseMenu() {
  const pauseMenu = document.getElementById('pause-menu');
  if (gameState.isPaused) {
    pauseMenu.classList.remove('hidden');
  } else {
    pauseMenu.classList.add('hidden');
  }
}

function endGame() {
  gameState.isPaused = true;
  updatePauseMenu();
  alert(`Game Over! Final Score: ${gameState.score}\nLevel: ${gameState.level}`);
  location.reload();
}

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
