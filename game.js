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
            frameQuantity: 2,
            active: false,
            visible: false,
            key: "bullet0"
        })
    }

    fireBullet(x, y, velocityX, velocityY, bullet_speed) {
        const bullet = this.getFirstDead(false);
        if (bullet) {
            bullet.fire(x, y, velocityX, velocityY, bullet_speed);
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

    fire(x, y, velocityX, velocityY, bullet_speed) {
        this.velocity = bullet_speed;
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.newVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        this.dzielnik = this.newVelocity / this.velocity;

        this.setVelocityX(velocityX / this.dzielnik);
        this.setVelocityY(velocityY / this.dzielnik);
        this.rotation = Phaser.Math.Angle.Between(x, y, game.input.mousePointer.x, game.input.mousePointer.y) + 1.57;
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= 0 || this.y > mapHeight || this.x <= 0 || this.x > mapWidth) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class OurScene extends Phaser.Scene {
    constructor() {
        super();
    }

    pointer;

    tank;
    tank_velocity = 5;
    tank_rotation_speed = 0.05;
    tank_HP = 50;

    turret;

    bulletGroup;
    bullet_speed = 600;

    money = 0;
    level = 1;
    text;

    explosion;

    diamond;

    enemyTank;

    blasterSound;
    explosionSound;

    background;

    // Keyboard-keys
    keyA;
    keyS;
    keyD;
    keyW;

    preload() {
        this.load.baseURL = 'https://examples.phaser.io/';

        this.load.image('tank', 'assets/games/tanks/tank1.png');
        this.load.atlas('tankAtlas', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');
        this.load.atlas('enemyTankAtlas', 'assets/games/tanks/enemy-tanks.png', 'assets/games/tanks/tanks.json');
        this.load.spritesheet('explosion', 'assets/games/invaders/explode.png', { frameWidth: 128, frameHeight: 128 })
        this.load.spritesheet('diamond', 'assets/particlestorm/sprites/diamonds32x5.png', { frameWidth: 64, frameHeight: 64 })
        this.load.image('bullet0', 'assets/misc/bullet0.png');

        this.load.image('bullet1', 'assets/misc/bullet1.png');
        this.load.image('bullet2', 'assets/misc/bullet2.png');

        // Sounds
        this.load.audio('blasterSound', '/assets/audio/SoundEffects/blaster.mp3');
        this.load.audio('explosionSound', '/assets/audio/SoundEffects/explosion.mp3');      // this.explosionSound.play();

        // Backgrounds
        this.load.image('lightGrass', '/assets/games/tanks/light_grass.png');
        this.load.image('darkGrass', '/assets/games/tanks/dark_grass.png');
        this.load.image('lightSand', '/assets/games/tanks/light_sand.png');
        this.load.image('sand', '/assets/games/tanks/sand.png');
        this.load.image('scorched_earth', '/assets/games/tanks/scorched_earth.png');
    }

    create() {
        // Background
        this.background = this.add.tileSprite(0, 0, mapWidth, mapHeight, 'lightSand');
        this.background.setOrigin(0)

        // Cursors
        this.pointer = this.input.activePointer;
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
        this.bulletGroup = new BulletGroup(this);

        // Scene data
        this.text = this.add.text(10, 10, '', { font: '32px Arial', fill: '#00ff00' });
        this.text.setScrollFactor(0);

        // Explosion
        this.explosion = this.physics.add.sprite(200, 300, 'explosion');
        this.anims.create({
            key: "anim_tank_destroyed",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("explosion"),
            repeat: -1
        });

        // Explosion
        this.diamond = this.physics.add.sprite(200, 100, 'diamond');
        this.anims.create({
            key: "anim_diamond",
            frameRate: 2,
            frames: this.anims.generateFrameNumbers("diamond"),
            repeat: -1
        });

        // // Enemy Tank
        // this.enemyTank = this.physics.add.sprite(64, 64, 'tank');
        // this.enemyTank.setOrigin(0.5, 0.5);
        // this.enemyTank.x = 500;
        // this.enemyTank.y = 300;

        // // Enemy Tank - animations
        // this.anims.create({
        //     key: "anim_enemy_tank_move",
        //     frameRate: 10,
        //     frames: this.anims.generateFrameNames("enemyTankAtlas", {
        //         prefix: "tank",
        //         start: 1,
        //         end: 6
        //     }),
        //     repeat: -1
        // });

        // // Enemy Tank - Turret
        // this.enemyTurret = this.physics.add.sprite(48, 28, "enemyTankAtlas", "turret");
        // this.enemyTurret.setOrigin(0.5, 0.5);
        // this.enemyTurret.x = 500;
        // this.enemyTurret.y = 300;

        // Collisions
        this.tank.setBounce(1, 1);
        this.enemyTank.setBounce(1, 1);
        //this.physics.add.collider(this.tank, this.enemyTank);
        //this.physics.add.collider(this.bulletGroup, this.enemyTank);

        // // Sound
        // this.blasterSound = this.sound.add("blasterSound");
        // this.explosionSound = this.sound.add("explosionSound");

        // Camera
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.tank.body.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.tank);
    }

    // tankRotation(flag) {
    //     let angle = this.tank.rotation;
    //     if (flag) {
    //         this.tank.x += Math.cos(angle) * this.tank_velocity;
    //         this.tank.y += Math.sin(angle) * this.tank_velocity;
    //     } else {
    //         this.tank.x -= Math.cos(angle) * this.tank_velocity;
    //         this.tank.y -= Math.sin(angle) * this.tank_velocity;
    //     }
    // }

    update() {
        // Tank - movement
        // this.tank.body.velocity.x = 0;
        // this.tank.body.velocity.y = 0;
        // if (this.keyA.isDown) {
        //     this.tank.rotation -= this.tank_rotation_speed;
        // }
        // if (this.keyD.isDown) {
        //     this.tank.rotation += this.tank_rotation_speed;
        // }
        // if (this.keyW.isDown) {
        //     this.tankRotation(true);
        // }
        // if (this.keyS.isDown) {
        //     this.tankRotation(false);
        // }

        // // Tank - animations
        // if (this.keyA.isDown || this.keyD.isDown || this.keyW.isDown || this.keyS.isDown) {
        //     this.tank.anims.play('anim_tank_move', true);
        // } else {
        //     this.tank.anims.play('anim_tank_move', false);
        // }

        // // Turret - movement
        // this.turret.body.velocity.x = 0;
        // this.turret.body.velocity.y = 0;
        // this.turret.rotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, this.input.mousePointer.x, this.input.mousePointer.y);
        // if (this.keyW.isDown) {
        //     this.turret.y = this.tank.y;
        //     this.turret.x = this.tank.x;
        // }
        // if (this.keyS.isDown) {
        //     this.turret.y = this.tank.y;
        //     this.turret.x = this.tank.x;
        // }

        // // Bullets
        // if (Phaser.Input.pointer.JustDown(this.spaceBar)) {
        //     this.bulletGroup.fireBullet(this.turret.x, this.turret.y,
        //         this.pointer.x - this.turret.x, this.pointer.y - this.turret.y, this.bullet_speed
        //     );
        //     this.blasterSound.play();
        // }
        // // if (this.pointer.isDown) {
        // //     this.bulletGroup.fireBullet(this.turret.x, this.turret.y,
        // //         this.pointer.x - this.turret.x, this.pointer.y - this.turret.y, this.bullet_speed
        // //     );
        // // } 

        // // Text
        // this.updateText();

        // // Explosion
        // this.explosion.anims.play("anim_tank_destroyed", true);

        // // Diamond
        // this.diamond.anims.play("anim_diamond", true);

        // // Enemy Tank
        // this.enemyTank.anims.play('anim_enemy_tank_move', true);

        // Collisions
        this.physics.collide(this.diamond, this.tank, this.collectDiamond);
        //this.physics.add.overlap(this.tank, this.enemyTank, this.collectStar, null, this);
        //this.physics.collide(this.bulletGroup, this.enemyTank, this.killEnemyTank);
    }

    collectDiamond(diamond) {
        diamond.disableBody(true, true);
        //this.money += 50;
        //this.updateText();
    }

    // killEnemyTank() {
    //     this.enemyTank.disableBody(true, true);
    // }

    updateText() {
        this.data.set('HP', this.tank_HP);
        this.data.set('Money', this.money);
        this.data.set('Level', this.level);

        this.text.setText([
            'HP: ' + this.data.get('HP'),
            'Money: ' + this.data.get('Money'),
            'Level: ' + this.data.get('Level')
        ]);
    }
}

var gameWidth = 800;
var gameHeight = 600;
var mapWidth = 1600;
var mapHeight = 1200;
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

var game = new Phaser.Game(config);
