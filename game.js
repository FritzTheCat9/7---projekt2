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

    }
}

class OurScene extends Phaser.Scene {
    constructor() {
        super();
    }

    tank;
    tank_velocity = 1;
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
    tankRotation() {
        let angle = Phaser.Math.RadToDeg(this.tank.rotation) % 360;
        if (angle < 0) {
            angle = 180 + (180 + angle);
        }
        console.log(angle);
        let newX, newY; // P1 P2
        let x = 2 * this.tank_velocity * Math.sin(angle);
        if (angle > 180) {
            x = 2 * this.tank_velocity * Math.sin(360 - angle);
        } else {
            x = 2 * this.tank_velocity * Math.sin(angle);
        }
        let y = Math.sqrt(Math.abs(this.tank_velocity * this.tank_velocity - (x * x)));
        if (angle >= 0 && angle < 90) {
            newY = this.tank.y - x;
            newX = this.tank.x - y;
            console.log("cwiartka 1")
        } else if (angle >= 90 && angle < 180) {
            newY = this.tank.y - x;
            newX = this.tank.x + y;
            console.log("cwiartka 2")

        }
        else if (angle >= 180 && angle < 270) {
            newY = this.tank.y + x;
            newX = this.tank.x + y;
            console.log("cwiartka 3")

        }
        else if (angle >= 270 && angle < 360) {
            newY = this.tank.y + x;
            newX = this.tank.x - y;
            console.log("cwiartka 4")

        }
        // console.log(this.tank.x);
        // console.log(this.tank.y);
        // console.log("---------------------------------");
        // console.log(newX);
        // console.log(newY);

        this.tank.x = newX;
        this.tank.y = newY;
    }
    update() {

        // Tank - movement
        this.tank.body.velocity.x = 0;
        this.tank.body.velocity.y = 0;
        if (this.keyA.isDown) {
            this.tank.rotation -= 0.01;
        }
        if (this.keyD.isDown) {
            this.tank.rotation += 0.01;
        }
        if (this.keyW.isDown) {
            this.tankRotation();
        }
        if (this.keyS.isDown) {
            this.tankRotation();
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

        if (this.keyW.isDown) {
            this.turret.y = this.tank.y;
            this.turret.x = this.tank.x;
        }
        if (this.keyS.isDown) {
            this.turret.y = this.tank.y;
            this.turret.x = this.tank.x;
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
