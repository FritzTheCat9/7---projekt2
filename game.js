var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "48a",
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

var game = new Phaser.Game(config);

var tank;
var tank_velocity = 250;
var turret;

var bullets;
var nextBulletTime = 0;

// Keyboard-keys
var keyA;
var keyS;
var keyD;
var keyW;

function preload() {
    this.load.baseURL = 'https://examples.phaser.io/';

    this.load.image('tank', 'assets/games/tanks/tank1.png');
    this.load.atlas('tankAtlas', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');

    this.load.image('bullet0', 'assets/misc/bullet0.png');
    this.load.image('bullet1', 'assets/misc/bullet1.png');
    this.load.image('bullet2', 'assets/misc/bullet2.png');
}

function create() {

    // Cursors
    cursors = this.input.keyboard.createCursorKeys();
    this.input.mouse.disableContextMenu();

    // Tank
    tank = this.physics.add.sprite(64, 64, 'tank');
    tank.setOrigin(0.5, 0.5);
    tank.x = 400;
    tank.y = 300;

    // Tank movement - keys declaration
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Tank - animations
    this.anims.create({
        key: "anim_tank_move",
        frameRate: 10,
        frames: this.anims.generateFrameNames("tankAtlas", {
            prefix: "tank",
            start: 1,
            end: 6
        }),
        repeat: -1
    });

    // Turret
    turret = this.physics.add.sprite(48, 28, "tankAtlas", "turret");
    turret.setOrigin(0.5, 0.5);
    turret.x = 400;
    turret.y = 300;

    // Bullets
    /*bullets = game.add.physicsGroup();
    bullets.createMultiple(30, 'bullet0');
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);*/

    /*bullet0 = this.physics.add.sprite(16, 64, 'bullet0');
    bullet1 = this.physics.add.sprite(32, 64, 'bullet1');
    bullet2 = this.physics.add.sprite(128, 128, 'bullet2');*/
}

function update() {

    // Tank - movement
    tank.body.velocity.x = 0;
    tank.body.velocity.y = 0;
    tank.rotation = Phaser.Math.Angle.Between(tank.x, tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
    if (keyA.isDown) {
        tank.body.velocity.x = -tank_velocity;
    }
    if (keyD.isDown) {
        tank.body.velocity.x = tank_velocity;
    }
    if (keyW.isDown) {
        tank.body.velocity.y = -tank_velocity;
    }
    if (keyS.isDown) {
        tank.body.velocity.y = tank_velocity;
    }

    // Tank - animations
    if (keyA.isDown || keyD.isDown || keyW.isDown || keyS.isDown) {
        tank.anims.play('anim_tank_move', true);
    } else {
        tank.anims.play('anim_tank_move', false);
    }

    // Turret - movement
    turret.body.velocity.x = 0;
    turret.body.velocity.y = 0;
    turret.rotation = Phaser.Math.Angle.Between(tank.x, tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
    if (keyA.isDown) {
        turret.body.velocity.x = -tank_velocity;
    }
    if (keyD.isDown) {
        turret.body.velocity.x = tank_velocity;
    }
    if (keyW.isDown) {
        turret.body.velocity.y = -tank_velocity;
    }
    if (keyS.isDown) {
        turret.body.velocity.y = tank_velocity;
    }

    // Bullets
    /*if (fire.isDown && game.time.now >= nextBulletTime) {
        var bullet = bullets.getFirstExists(false);
        if (bullet) {
            bullet.reset(player.body.x, player.body.y);
            bullet.body.velocity.x = 400;
            nextBulletTime = game.time.now + 100;
        }
    }*/

}
