//Classes

// function sleep(milliseconds) {
//     const date = Date.now();
//     let currentDate = null;
//     do {
//         currentDate = Date.now();
//     } while (currentDate - date < milliseconds);
// }
class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene)

        this.createMultiple({
            classType: Bullet,
            frameQuantity: 10,
            active: false,
            visible: false,
            key: "bullet0"
        })
    }

    fireBullet(x, y, velocityX, velocityY) {
        const bullet = this.getFirstDead(false);
        if (bullet) {
            bullet.fire(x, y, velocityX, velocityY);
        }
        console.log("C");


    }
}
class Bullet extends Phaser.Physics.Arcade.Sprite {
    velocity = 600;
    newVelocity = 0;
    dzielnik = 1;
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet0')
    }

    fire(x, y, velocityX, velocityY) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.newVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        this.dzielnik = this.newVelocity / this.velocity;

        this.setVelocityX(velocityX / this.dzielnik);
        this.setVelocityY(velocityY / this.dzielnik);
        this.rotation = Phaser.Math.Angle.Between(x, y, game.input.mousePointer.x, game.input.mousePointer.y) + 1.57;
        // this.rotation = Phaser.Math.Angle.Between(x, y, this.input.mousePointer.x, this.input.mousePointer.y) + 1.57;
        console.log("A");
        // console.log(velocityY);
        // console.log("------------------------");
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= 0 || this.y > gameHeight || this.x <= 0 || this.x > gameWidth) {
            this.setActive(false);
            this.setVisible(false);
        }
        console.log("B");

    }
}

class OurScene extends Phaser.Scene {
    constructor() {
        super();
    }



    tank;
    tank_velocity = 250;
    turret;

    // bullets;
    // nextBulletTime = 0;

    // Keyboard-keys
    keyA;
    keyS;
    keyD;
    keyW;

    preload() {
        this.load.baseURL = 'https://examples.phaser.io/';

        this.load.image('tank', 'assets/games/tanks/tank1.png');
        this.load.atlas('tankAtlas', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');

        this.load.image('bullet0', 'assets/misc/bullet0.png');
        this.load.image('bullet1', 'assets/misc/bullet1.png');
        this.load.image('bullet2', 'assets/misc/bullet2.png');
    }

    create() {

        // Cursors
        // cursors = this.input.keyboard.createCursorKeys();
        this.input.mouse.disableContextMenu();

        // Tank
        this.tank = this.physics.add.sprite(64, 64, 'tank');
        this.tank.setOrigin(0.5, 0.5);
        this.tank.x = 400;
        this.tank.y = 300;

        // Tank movement - keys declaration
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
        this.turret = this.physics.add.sprite(48, 28, "tankAtlas", "turret");
        this.turret.setOrigin(0.5, 0.5);
        this.turret.x = 400;
        this.turret.y = 300;

        // Bullets
        /*bullets = game.add.physicsGroup();
        bullets.createMultiple(30, 'bullet0');
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);*/

        /*bullet0 = this.physics.add.sprite(16, 64, 'bullet0');
        bullet1 = this.physics.add.sprite(32, 64, 'bullet1');
        bullet2 = this.physics.add.sprite(128, 128, 'bullet2');*/

        // Bullets
        this.bulletGroup = new BulletGroup(this);

    }

    update() {

        // Tank - movement
        this.tank.body.velocity.x = 0;
        this.tank.body.velocity.y = 0;
        this.tank.rotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
        if (this.keyA.isDown) {
            this.tank.body.velocity.x = -this.tank_velocity;
        }
        if (this.keyD.isDown) {
            this.tank.body.velocity.x = this.tank_velocity;
        }
        if (this.keyW.isDown) {
            this.tank.body.velocity.y = -this.tank_velocity;
        }
        if (this.keyS.isDown) {
            this.tank.body.velocity.y = this.tank_velocity;
        }

        // Tank - animations
        if (this.keyA.isDown || this.keyD.isDown || this.keyW.isDown || this.keyS.isDown) {
            this.tank.anims.play('anim_tank_move', true);
        } else {
            this.tank.anims.play('anim_tank_move', false);
        }

        // Turret - movement
        this.turret.body.velocity.x = 0;
        this.turret.body.velocity.y = 0;
        this.turret.rotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
        if (this.keyA.isDown) {
            this.turret.body.velocity.x = -this.tank_velocity;
        }
        if (this.keyD.isDown) {
            this.turret.body.velocity.x = this.tank_velocity;
        }
        if (this.keyW.isDown) {
            this.turret.body.velocity.y = -this.tank_velocity;
        }
        if (this.keyS.isDown) {
            this.turret.body.velocity.y = this.tank_velocity;
        }

        // Bullets
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            this.bulletGroup.fireBullet(this.turret.x, this.turret.y,
                this.input.mousePointer.x - this.turret.x, this.input.mousePointer.y - this.turret.y,
            );
        }

    }
}
var gameWidth = 800;
var gameHeight = 600;
var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    backgroundColor: "48a",
    // parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: OurScene
};

game = new Phaser.Game(config);
