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
        this.scene = scene;
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 10,
            active: false,
            visible: false,
            key: "bullet0"
        })
    }

    fireBullet(x, y, velocityX, velocityY, bullet_speed) {
        const bullet = this.getFirstDead(false);
        if (bullet) {
            bullet.fire(x, y, velocityX, velocityY, bullet_speed);
            this.scene.blasterSound.play();
        }


    }
}
class Bullet extends Phaser.Physics.Arcade.Sprite {
    velocity = 600; // bullet_speed
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

        //Camera
        var camera = this.scene.cameras.main;

        this.rotation = Phaser.Math.Angle.Between(x, y, game.input.mousePointer.x + camera.scrollX, game.input.mousePointer.y + camera.scrollY) + 1.57;
        // this.rotation = Phaser.Math.Angle.Between(x, y, this.input.mousePointer.x, this.input.mousePointer.y) + 1.57;
        // console.log(velocityY);
        // console.log("------------------------");
    }
    // preUpdate(time, delta) {
    //     super.preUpdate(time, delta);
    // }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= 0 || this.y > mapHeight || this.x <= 0 || this.x > mapWidth) {
            this.setActive(false);
            this.setVisible(false);
        }

    }
}

class Tank extends Phaser.Physics.Arcade.Sprite {
    tank_velocity = 5;
    tank_rotation_speed = 0.05;
    move_animation = 'anim_tank_move';
    tank_HP = 50;

    constructor(scene, x, y, turret, tank, anim_tank_move, tankAtlas) {
        super(scene, x, y, tank)
        // Tank
        this.tank = scene.physics.add.sprite(64, 64, tank);
        this.tank.setOrigin(0.5, 0.5);
        this.tank.x = x;
        this.tank.y = y;
        this.move_animation = anim_tank_move;

        // Tank - animations
        scene.anims.create({
            key: anim_tank_move,
            frameRate: 10,
            frames: this.anims.generateFrameNames(tankAtlas, {
                prefix: tank,
                start: 1,
                end: 6
            }),
            repeat: -1
        });

        //Turret
        this.turret = new Turret(scene, x, y, turret, tankAtlas);

        //AI
        this.AI = new AI(this);
        console.log(this)
    }
    disable() {
        this.tank.disableBody(true, true);
        this.tank.setActive(false);
        this.tank.setVisible(false);

        this.turret.turret.disableBody(true, true);
        this.turret.turret.setActive(false);
        this.turret.turret.setVisible(false);

        // Explosion
        this.scene.explosion.x = this.tank.x;
        this.scene.explosion.y = this.tank.y;
        this.scene.explosion.anims.play("anim_tank_destroyed", false);
        this.scene.explosionSound.play();

    }
    rotate(flag) {
        if (flag) {
            this.tank.rotation -= this.tank_rotation_speed;
        } else {
            this.tank.rotation += this.tank_rotation_speed;
        }
    }
    tankRotation(flag) {
        let angle = this.tank.rotation;
        if (flag) {
            this.tank.x += Math.cos(angle) * this.tank_velocity;
            this.tank.y += Math.sin(angle) * this.tank_velocity;
        } else {
            this.tank.x -= Math.cos(angle) * this.tank_velocity;
            this.tank.y -= Math.sin(angle) * this.tank_velocity;
        }
        this.turret.move(this.tank.x, this.tank.y);
    }
    animation(flag) {
        // Tank - animations
        if (flag) {
            this.tank.anims.play(this.move_animation, true);
        } else {
            this.tank.anims.play(this.move_animation, false);
        }
    }
}

class Turret extends Phaser.Physics.Arcade.Sprite {
    bullet_speed = 600;

    constructor(scene, x, y, turret, tankAtlas) {
        super(scene, x, y, turret)
        this.scene = scene;
        // Turret
        this.turret = scene.physics.add.sprite(48, 28, tankAtlas, turret);
        this.turret.setOrigin(0.5, 0.5);
        this.turret.x = x;
        this.turret.y = y;

        // Bullets
        this.bulletGroup = new BulletGroup(scene);
    }
    move(x, y) {
        this.turret.x = x;
        this.turret.y = y;
    }
    turretRotation() {
        var camera = this.scene.cameras.main;
        // Turret - movement
        this.turret.body.velocity.x = 0;
        this.turret.body.velocity.y = 0;
        this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, this.scene.input.mousePointer.x + camera.scrollX, this.scene.input.mousePointer.y + camera.scrollY);

    }
    changeBulletSpeed(newBulletSpeed) {
        this.bullet_speed = newBulletSpeed;
    }
    fire(mouseX, mouseY) {
        var camera = this.scene.cameras.main;
        this.bulletGroup.fireBullet(this.turret.x, this.turret.y, mouseX + camera.scrollX - this.turret.x, mouseY + camera.scrollY - this.turret.y, this.bullet_speed);
    }
}
class AI {
    constructor(object) {
        this.object = object;
    }
    revive() {
        this.object.tankRotation(Math.round(Math.random()));
    }
}

class Diamond extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y)
        this.scene = scene;
        // Diamond
        this.diamond = scene.physics.add.sprite(200, 100, 'diamond');
        this.diamond.setOrigin(0.5, 0.5);
        this.diamond.x = x;
        this.diamond.y = y;
    }

    canCollide() {
        this.scene.physics.collide(this.diamond, this.scene.player.tank, () => this.collectDiamond());
    }
    collectDiamond() {
        this.diamond.disableBody(true, true);
        this.diamond.setActive(false);
        this.diamond.setVisible(false);
        this.scene.powerupSound.play();
        console.log(this)
        this.scene.player.tank_HP = 50;
    }
    animation(flag) {
        if (flag) {
            this.diamond.anims.play("anim_diamond", true);
        } else {
            this.diamond.anims.play("anim_diamond", false);
        }
    }
}

class OurScene extends Phaser.Scene {
    constructor() {
        super();
    }
    turret;

    // Keyboard-keys
    keyA;
    keyS;
    keyD;
    keyW;

    // Player
    player;

    // Enemy
    enemies;

    // Text
    text;

    // Statystyki - wyświetlone na ekranie
    //tank_HP = 50;
    money = 0;
    level = 1;

    // Myszka
    pointer;

    // Animations
    explosion;

    // PowerUps
    diamonds;
    diamond;

    // Sounds
    blasterSound;
    explosionSound;
    powerupSound;

    // Background
    background;

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
        this.load.audio('powerupSound', '/assets/audio/SoundEffects/key.wav');              // this.powerupSound.play();

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

        // Tank movement - keys declaration
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.player = new Tank(this, 400, 300, "turret", "tank", "anim_tank_move", "tankAtlas");
        this.enemies = new Tank(this, 100, 200, "turret", "tank", "anim_enemy_tank_move", "enemyTankAtlas");
        this.spawnDiamonds(this, 10);
        this.diamond123 = new Diamond(this, 40, 40);
        //this.player.turret.changeBulletSpeed(30);

        // Sound
        this.blasterSound = this.sound.add("blasterSound");
        this.explosionSound = this.sound.add("explosionSound");
        this.powerupSound = this.sound.add("powerupSound");

        // Camera
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.player.tank.body.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player.tank);

        // Scene data
        this.text = this.add.text(10, 10, '', { font: '32px Arial', fill: '#00ff00' });
        this.text.setScrollFactor(0);

        // Explosion
        this.explosion = this.physics.add.sprite(-200, -200, 'explosion');
        this.anims.create({
            key: "anim_tank_destroyed",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("explosion"),
            repeat: 0
        });

        // Diamond
        //this.diamond = this.physics.add.sprite(200, 100, 'diamond');
        this.anims.create({
            key: "anim_diamond",
            frameRate: 2,
            frames: this.anims.generateFrameNumbers("diamond"),
            repeat: -1
        });

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

        // Enemy Tank - animations
        this.anims.create({
            key: "anim_enemy_tank_move",
            frameRate: 10,
            frames: this.anims.generateFrameNames("enemyTankAtlas", {
                prefix: "tank",
                start: 1,
                end: 6
            }),
            repeat: -1
        });
    }

    spawnDiamonds(scene, quantity) {
        scene.diamonds = new Array(quantity);
        for (let i = 0; i < quantity; i++) {
            const diamond = new Diamond(this, 400 + (i * 100), 500);
            scene.diamonds[i] = diamond;
        }
        for (let i = 0; i < quantity; i++) {
            scene.diamonds[i].animation(true);
            scene.diamonds[i].canCollide();
        }
        console.log(scene.diamonds)
    }

    update() {

        // Tank - movement
        this.player.tank.body.velocity.x = 0;
        this.player.tank.body.velocity.y = 0;
        if (this.keyA.isDown) {
            this.player.rotate(true);
        }
        if (this.keyD.isDown) {
            this.player.rotate(false);
        }
        if (this.keyW.isDown) {
            this.player.tankRotation(true);
        }
        if (this.keyS.isDown) {
            this.player.tankRotation(false);
        }

        this.player.animation(this.keyA.isDown || this.keyD.isDown
            || this.keyW.isDown || this.keyS.isDown);

        this.player.turret.turretRotation();

        // Bullets
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            this.player.turret.fire(
                this.input.mousePointer.x, this.input.mousePointer.y
            );
        }

        //AI
        this.enemies.animation(true);
        //this.enemies.AI.revive();

        // Text
        this.updateText();

        // Diamond
        //this.diamond.anims.play("anim_diamond", true);
        this.diamond123.animation(true);
        this.diamond123.canCollide();

        // Collisions
        //this.physics.collide(this.diamond, this.player.tank, () => this.collectDiamond(this.diamond));
        this.physics.collide(this.enemies.tank, this.player.turret.bulletGroup, () => this.disableObject(this.enemies));
        // // this.physics.collide(this.enemies.tank, this.player.tank);
        // this.player.tank.setBounce(0.2);
        // this.enemies.tank.setBounce(0.2);
        // this.physics.add.collider(this.player.tank, this.enemies.tank);

    }
    tankColide(object) {
        if (this.keyW.isDown) {
            object.tankRotation(false);
        }
        else if (this.keyS.isDown) {
            object.tankRotation(true);
        }
        this.hp -= 10;

    }
    disableObject(object) {
        object.disable();
        this.money += 50;
    }
    /*collectDiamond(diamond) {
        diamond.disableBody(true, true);
        this.tank_HP = 50;
        this.powerupSound.play();
    }*/
    updateText() {
        this.data.set('HP', this.player.tank_HP);
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

game = new Phaser.Game(config);
