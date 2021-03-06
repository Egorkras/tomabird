var config = {
  type: Phaser.AUTO,
  backgroundColor: '#2dab2d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 288,
    height: 512,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 1200,
      },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const assets = {
  bird: {
    red: 'bird-red',
  },
  obstacle: {
    pipe: {
      green: {
        top: 'pipe-green-top',
        bottom: 'pipe-green-bottom',
      },
      red: {
        top: 'pipe-red-top',
        bottom: 'pipe-red-bottom',
      },
    },
  },
  scene: {
    width: 144,
    background: {
      day: 'background-day',
      night: 'background-night',
    },
    ground: 'ground',
    gameOver: 'game-over',
    restart: 'restart-button',
    messageInitial: 'message-initial',
  },
  scoreboard: {
    width: 25,
    base: 'number',
    number0: 'number0',
    number1: 'number1',
    number2: 'number2',
    number3: 'number3',
    number4: 'number4',
    number5: 'number5',
    number6: 'number6',
    number7: 'number7',
    number8: 'number8',
    number9: 'number9',
  },
  animation: {
    bird: {
      red: {
        clapWings: 'red-clap-wings',
        stop: 'red-stop',
      },
    },
    ground: {
      moving: 'moving-ground',
      stop: 'stop-ground',
    },
  },
};

var game = new Phaser.Game(config);

let gameOver;
let gameStarted;
let upButton;
let restartButton;
let gameOverBanner;
let messageInitial;
let player;
let birdName;
let backgroundDay;
let backgroundNight;
let group;
let gapsGroup;
let nextPipes;
let currentPipe;
let scoreboardGroup;
let score;

let death1;
let death2;
let jump;

function preload() {
  this.physics.world.setFPS(60);
  // Backgrounds and ground
  this.load.image(assets.scene.background.day, 'assets/background-day.png');
  this.load.image(assets.scene.background.night, 'assets/background-night.png');
  this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
    frameWidth: 336,
    frameHeight: 112,
  });

  // Pipes
  this.load.image(assets.obstacle.pipe.green.top, 'assets/pipe-green-top.png');
  this.load.image(
    assets.obstacle.pipe.green.bottom,
    'assets/pipe-green-bottom.png'
  );
  this.load.image(assets.obstacle.pipe.red.top, 'assets/pipe-red-top.png');
  this.load.image(
    assets.obstacle.pipe.red.bottom,
    'assets/pipe-red-bottom.png'
  );

  // Start game
  this.load.image(assets.scene.messageInitial, 'assets/message-initial.png');

  // End game
  this.load.image(assets.scene.gameOver, 'assets/gameover.png');
  this.load.image(assets.scene.restart, 'assets/restart-button.png');

  // Bird
  this.load.spritesheet(assets.bird.red, 'assets/bird-red-sprite.png', {
    frameWidth: 35,
    frameHeight: 24,
  });

  // Numbers
  this.load.image(assets.scoreboard.number0, 'assets/number0.png');
  this.load.image(assets.scoreboard.number1, 'assets/number1.png');
  this.load.image(assets.scoreboard.number2, 'assets/number2.png');
  this.load.image(assets.scoreboard.number3, 'assets/number3.png');
  this.load.image(assets.scoreboard.number4, 'assets/number4.png');
  this.load.image(assets.scoreboard.number5, 'assets/number5.png');
  this.load.image(assets.scoreboard.number6, 'assets/number6.png');
  this.load.image(assets.scoreboard.number7, 'assets/number7.png');
  this.load.image(assets.scoreboard.number8, 'assets/number8.png');
  this.load.image(assets.scoreboard.number9, 'assets/number9.png');

  this.load.audio('death1', ['assets/audio/mission-failed.mp3']);
  this.load.audio('death2', ['assets/audio/roblox-death.mp3']);
  this.load.audio('jump', ['assets/audio/jump.mp3']);
}

function create() {
  backgroundDay = this.add
    .image(assets.scene.width, 256, assets.scene.background.day)
    .setInteractive();
  backgroundDay.on('pointerdown', moveBird);

  backgroundNight = this.add
    .image(assets.scene.width, 256, assets.scene.background.night)
    .setInteractive();
  backgroundNight.on('pointerdown', moveBird);

  gapsGroup = this.physics.add.group();
  pipesGroup = this.physics.add.group();
  scoreboardGroup = this.physics.add.staticGroup();

  ground = this.physics.add.sprite(
    assets.scene.width,
    458,
    assets.scene.ground
  );
  ground.setCollideWorldBounds(true);
  ground.setDepth(10);

  messageInitial = this.add.image(
    assets.scene.width,
    156,
    assets.scene.messageInitial
  );
  messageInitial.setDepth(30);
  messageInitial.visible = false;

  upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

  this.anims.create({
    key: assets.animation.ground.moving,
    frames: this.anims.generateFrameNumbers(assets.scene.ground, {
      start: 0,
      end: 2,
    }),
    frameRate: 15,
    repeat: -1,
  });
  this.anims.create({
    key: assets.animation.ground.stop,
    frames: [
      {
        key: assets.scene.ground,
        frame: 0,
      },
    ],
    frameRate: 20,
  });

  //  Tomahawk Animation
  this.anims.create({
    key: assets.animation.bird.red.clapWings,
    frames: this.anims.generateFrameNumbers(assets.bird.red, {
      start: 0,
      end: 2,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: assets.animation.bird.red.stop,
    frames: [
      {
        key: assets.bird.red,
        frame: 1,
      },
    ],
    frameRate: 20,
  });

  //Sound
  death1 = this.sound.add('death1');
  death2 = this.sound.add('death2');
  jump = this.sound.add('jump');

  prepareGame(this);

  gameOverBanner = this.add.image(
    assets.scene.width,
    206,
    assets.scene.gameOver
  );
  gameOverBanner.setDepth(20);
  gameOverBanner.visible = false;

  restartButton = this.add
    .image(assets.scene.width, 300, assets.scene.restart)
    .setInteractive();
  restartButton.on('pointerdown', restartGame);
  restartButton.setDepth(20);
  restartButton.visible = false;
}

function update(time, delta) {
  //do not run the update loop
  if (gameOver || !gameStarted) return;

  if (framesMoveUp > 0) framesMoveUp--;
  else if (Phaser.Input.Keyboard.JustDown(upButton)) moveBird();
  else {
    // player.setVelocityY(120)

    if (player.angle < 90) player.angle += 1;
  }

  pipesGroup.children.iterate(function (child) {
    if (child == undefined) return;

    if (child.x < -50) child.destroy();
    else child.setVelocityX(-100);
  });

  gapsGroup.children.iterate(function (child) {
    child.body.setVelocityX(-100);
  });

  nextPipes += delta;
  if (nextPipes >= 1900) {
    makePipes(game.scene.scenes[0]);
    nextPipes = 0;
  }
}

function playRandomDeathSound() {
  var random = Phaser.Math.Between(1, 2);
  switch (random) {
    case 1:
      death1.play();
    case 2:
      death2.play();
  }
}

function hitBird(player) {
  this.physics.pause();
  playRandomDeathSound();

  gameOver = true;
  gameStarted = false;

  player.anims.play(assets.animation.bird.red.stop);
  ground.anims.play(assets.animation.ground.stop);

  gameOverBanner.visible = true;
  restartButton.visible = true;
}

function updateScore(_, gap) {
  score++;
  gap.destroy();

  if (score % 10 == 0) {
    backgroundDay.visible = !backgroundDay.visible;
    backgroundNight.visible = !backgroundNight.visible;

    if (currentPipe === assets.obstacle.pipe.green)
      currentPipe = assets.obstacle.pipe.red;
    else currentPipe = assets.obstacle.pipe.green;
  }

  updateScoreboard();
}

function makePipes(scene) {
  if (!gameStarted || gameOver) return;

  const pipeTopY = Phaser.Math.Between(-120, 120);

  const gap = scene.add.line(400, pipeTopY + 210, 0, 0, 0, 98);
  gapsGroup.add(gap);
  gap.body.allowGravity = false;

  gap.visible = false;

  const pipeTop = pipesGroup.create(400, pipeTopY, currentPipe.top);
  pipeTop.body.allowGravity = false;

  const pipeBottom = pipesGroup.create(400, pipeTopY + 420, currentPipe.bottom);
  pipeBottom.body.allowGravity = false;
}

function moveBird() {
  if (gameOver) return;

  if (!gameStarted) startGame(game.scene.scenes[0]);

  player.setVelocityY(-350);
  player.angle = -15;
  framesMoveUp = 5;

  jump.play();
}

function updateScoreboard() {
  scoreboardGroup.clear(true, true);

  const scoreAsString = score.toString();
  if (scoreAsString.length == 1)
    scoreboardGroup
      .create(assets.scene.width, 30, assets.scoreboard.base + score)
      .setDepth(10);
  else {
    let initialPosition =
      assets.scene.width -
      (score.toString().length * assets.scoreboard.width) / 2;

    for (let i = 0; i < scoreAsString.length; i++) {
      scoreboardGroup
        .create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i])
        .setDepth(10);
      initialPosition += assets.scoreboard.width;
    }
  }
}

function restartGame() {
  pipesGroup.clear(true, true);
  pipesGroup.clear(true, true);
  gapsGroup.clear(true, true);
  scoreboardGroup.clear(true, true);
  player.destroy();
  gameOverBanner.visible = false;
  restartButton.visible = false;

  const gameScene = game.scene.scenes[0];
  prepareGame(gameScene);

  gameScene.physics.resume();
}

function prepareGame(scene) {
  framesMoveUp = 0;
  nextPipes = 0;
  currentPipe = assets.obstacle.pipe.green;
  score = 0;
  gameOver = false;
  backgroundDay.visible = true;
  backgroundNight.visible = false;
  messageInitial.visible = true;

  birdName = assets.bird.red;
  player = scene.physics.add.sprite(60, 265, birdName);
  player.body.setSize(28, 18);
  player.setCollideWorldBounds(true);
  player.anims.play(assets.animation.bird.red.clapWings, true);
  player.body.allowGravity = false;

  scene.physics.add.collider(player, ground, hitBird, null, scene);
  scene.physics.add.collider(player, pipesGroup, hitBird, null, scene);

  scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene);

  ground.anims.play(assets.animation.ground.moving, true);
}

function startGame(scene) {
  gameStarted = true;
  messageInitial.visible = false;
  player.body.allowGravity = true;

  const score0 = scoreboardGroup.create(
    assets.scene.width,
    30,
    assets.scoreboard.number0
  );
  score0.setDepth(20);

  makePipes(scene);
}
