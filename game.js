var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "48a",
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
    },
};

var game = new Phaser.Game(config);
var tank;

// Keyboard-keys
let keyA;
let keyS;
let keyD;
let keyW;

function preload() {
    this.load.baseURL = 'https://examples.phaser.io/assets/games/';


    this.load.image('tank', 'tanks/tank1.png');
}

function create() {
    // Cursors
    cursors = this.input.keyboard.createCursorKeys();

    // Tank
    tank = this.physics.add.sprite(64, 64, 'tank');
    tank.setOrigin(0.5, 0.5);
    tank.x = 400;
    tank.y = 300;
    tank.body.setCollideWorldBounds(true);

    // Tank movement - keys declaration
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
}

function update() {

    // Tank - movement
    tank.body.velocity.x = 0;
    tank.body.velocity.y = 0;
    tank.rotation = Phaser.Math.Angle.Between(tank.x, tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
    if (keyA.isDown) {
        tank.body.velocity.x = -250;
    }
    if (keyD.isDown) {
        tank.body.velocity.x = 250;
    }
    if (keyW.isDown) {
        tank.body.velocity.y = -250;
    }
    if (keyS.isDown) {
        tank.body.velocity.y = 250;
    }
}