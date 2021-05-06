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

    tank.body.velocity.x = 100;
    tank.body.velocity.y = -150;
}

function update() {
    /*tank.body.velocity.x = 0;
    tank.body.velocity.y = 0;*/
    if (cursors.left.isDown) {
        tank.body.velocity.x = -250;
    }
    else if (cursors.right.isDown) {
        tank.body.velocity.x = 250;
    }
    if (cursors.up.isDown) {
        tank.body.velocity.y = -250;
    }
    else if (cursors.down.isDown) {
        tank.body.velocity.y = 250;
    }

    /*if (cursors.left.isDown) {
        tank.body.velocity.x = -250;
    } else {
        tank.body.velocity.x = 0;
    }
    if (cursors.right.isDown) {
        tank.body.velocity.x = 250;
    } else {
        tank.body.velocity.x = 0;
    }
    if (cursors.up.isDown) {
        tank.body.velocity.y = -250;
    } else {
        tank.body.velocity.y = 0;
    }
    if (cursors.down.isDown) {
        tank.body.velocity.y = 250;
    } else {
        tank.body.velocity.y = 0;
    }*/

    if (cursors.left.isUp) {
        tank.body.velocity.x = 0;
    }
    if (cursors.right.isUp) {
        tank.body.velocity.x = 0;
    }
    if (cursors.up.isUp) {
        tank.body.velocity.y = 0;
    }
    if (cursors.down.isUp) {
        tank.body.velocity.y = 0;
    }
}