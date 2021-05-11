
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
        Phaser.Actions.SetXY(this.getChildren(), -200, -200);
    }
    nextShotTime = 2000;
    shotDelay = 2000;
    fireBullet(x, y, velocityX, velocityY, bullet_speed) {
        const bullet = this.getFirstDead(false);

        if (this.nextShotTime < this.scene.time.now) {
            this.nextShotTime = this.scene.time.now + this.shotDelay;

            if (bullet) {
                bullet.fire(x, y, velocityX, velocityY, bullet_speed);
                this.scene.blasterSound.play();
            }
        }
    }
    fireBulletToTarget(x, y, velocityX, velocityY, bullet_speed, turret_rotation) {
        const bullet = this.getFirstDead(false);

        if (this.nextShotTime < this.scene.time.now) {
            this.nextShotTime = this.scene.time.now + this.shotDelay;

            if (bullet) {
                bullet.fireToTarget(x, y, velocityX, velocityY, bullet_speed, turret_rotation);
                this.scene.blasterSound.play();
            }
        }
    }
    disable() {
        this.setActive(false);
        this.setVisible(false);
        (this.getFirstAlive()).disable();
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
    }
    fireToTarget(x, y, velocityX, velocityY, bullet_speed, turret_rotation) {
        this.velocity = bullet_speed;
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.newVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        this.dzielnik = this.newVelocity / this.velocity;
        this.setVelocityX(velocityX / this.dzielnik);
        this.setVelocityY(velocityY / this.dzielnik);
        var camera = this.scene.cameras.main;
        this.rotation = turret_rotation + 1.57;
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= 0 || this.y > mapHeight || this.x <= 0 || this.x > mapWidth) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
    disable() {
        this.body.reset(-100, -100);
        this.setActive(false);
        this.setVisible(false);
    }
}

class Tank extends Phaser.Physics.Arcade.Sprite {
    tank_velocity = 3;
    tank_rotation_speed = 0.05;
    move_animation = 'anim_tank_move';
    tank_HP = 100;
    follow_flag = true;

    active = false;

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

        this.follow_flag = false;

        this.active = false;
    }
    hit() {
        this.tank_HP -= 5;
        this.turret.turret.x = this.tank.x;
        this.turret.turret.y = this.tank.y;
        // this.bulletGroup.removeFromScene();
        //this.scene.remove("bullet0");
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
    followPlayer() {
        if (this.follow_flag) {
            // target or player's x, y
            const tx = this.scene.player.tank.x;
            const ty = this.scene.player.tank.y;

            // enemy's x, y
            var camera = this.scene.cameras.main;
            const x = this.tank.x
            const y = this.tank.y;

            const rotation = Phaser.Math.Angle.Between(x, y, tx, ty);
            this.tank.rotation = rotation;

            let d = Math.sqrt(Math.abs(tx - x) * Math.abs(tx - x) + Math.abs(ty - y) * Math.abs(ty - y))
            if (d > 100) {
                if (tx >= x) {
                    this.tank.x += this.tank_velocity / 6;
                }
                if (tx <= x) {
                    this.tank.x -= this.tank_velocity / 6;
                }
                if (ty >= y) {
                    this.tank.y += this.tank_velocity / 6;
                }
                if (ty <= y) {
                    this.tank.y -= this.tank_velocity / 6;
                }
            }

            this.turret.move(this.tank.x, this.tank.y);
            this.turret.rotateTurret(tx, ty);
            //this.turret.fire(tx, ty);
            this.turret.fireToTarget(tx, ty);
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
    rotateTurret(toX, toY) {
        this.turret.body.velocity.x = 0;
        this.turret.body.velocity.y = 0;
        this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, toX, toY);
    }
    changeBulletSpeed(newBulletSpeed) {
        this.bullet_speed = newBulletSpeed;
    }
    fire(mouseX, mouseY) {
        var camera = this.scene.cameras.main;
        this.bulletGroup.fireBullet(this.turret.x, this.turret.y, mouseX + camera.scrollX - this.turret.x, mouseY + camera.scrollY - this.turret.y, this.bullet_speed);
    }
    fireToTarget(targetX, targetY) {
        var camera = this.scene.cameras.main;
        this.bulletGroup.fireBulletToTarget(this.turret.x, this.turret.y, targetX - this.turret.x, targetY - this.turret.y, this.bullet_speed, this.turret.rotation);
    }
}

class Diamond extends Phaser.Physics.Arcade.Sprite {

    active = false;

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
        this.scene.player.tank_HP = this.scene.max_level_hp;
        this.active = false;
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
    money = 0;
    level = 1;

    // Myszka
    pointer;

    // Animations
    explosion;

    // PowerUps
    quantity = 10;
    diamonds;
    diamond;

    // Sounds
    blasterSound;
    explosionSound;
    powerupSound;

    // Background
    background;

    // Buttons 
    hp_level = 0;
    max_level_hp = 100;

    movement_speed_level = 0;
    max_movement_speed_level = 10;

    rotation_speed_level = 0;
    max_rotation_speed_level = 0.10;

    bullet_speed_level = 0;
    max_bullet_speed_level = 400;

    iloscWrogow = 10;

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
        this.player.tank.setCollideWorldBounds(true);
        this.spawnDiamonds(this, this.quantity);

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

        // Button - tank HP
        this.button_upgrade_hp_text = this.add.text(120, 500, '', { fill: '#0f0' });
        this.button_upgrade_hp_text.setScrollFactor(0);
        const button_upgrade_hp = this.add.text(10, 500, 'Upgrade HP', { fill: '#00f' })
            .setInteractive()
            .on('pointerdown', () => this.updateUpgradeHpButtonText());
        button_upgrade_hp.setScrollFactor(0);
        this.updateUpgradeHpButtonText();

        // Button - tank movement speed
        this.button_upgrade_movement_speed = this.add.text(230, 530, '', { fill: '#0f0' });
        this.button_upgrade_movement_speed.setScrollFactor(0);
        const button_upgrade_movement = this.add.text(10, 530, 'Upgrade movement speed', { fill: '#00f' })
            .setInteractive()
            .on('pointerdown', () => this.updateUpgradeMovementSpeedButtonText());
        button_upgrade_movement.setScrollFactor(0);
        this.updateUpgradeMovementSpeedButtonText();

        // Button - tank rotation speed
        this.button_upgrade_rotation_speed_level = this.add.text(230, 560, '', { fill: '#0f0' });
        this.button_upgrade_rotation_speed_level.setScrollFactor(0);
        const button_upgrade_rotation = this.add.text(10, 560, 'Upgrade rotation speed', { fill: '#00f' })
            .setInteractive()
            .on('pointerdown', () => this.updateUpgradeRotationSpeedButtonText());
        button_upgrade_rotation.setScrollFactor(0);
        this.updateUpgradeRotationSpeedButtonText();

        // Button - tank rotation speed
        this.button_upgrade_bullet_speed_level = this.add.text(230, 470, '', { fill: '#0f0' });
        this.button_upgrade_bullet_speed_level.setScrollFactor(0);
        const button_upgrade_bullet_speed = this.add.text(10, 470, 'Upgrade bullet speed', { fill: '#00f' })
            .setInteractive()
            .on('pointerdown', () => this.updateUpgradeBulletSpeedButtonText());
        button_upgrade_bullet_speed.setScrollFactor(0);
        this.updateUpgradeBulletSpeedButtonText();

        // Enemies
        this.spawnEnemies(this, this.iloscWrogow);

    }

    updateUpgradeBulletSpeedButtonText() {
        if (this.money >= 300 && this.bullet_speed_level == 0) {
            this.bullet_speed_level++;
            this.money -= 300;
            this.max_bullet_speed_level = 800;
            this.player.turret.bulletGroup.nextShotTime = 800;
            this.player.turret.bulletGroup.shotDelay = 800;
        }
        else if (this.money >= 500 && this.bullet_speed_level == 1) {
            this.bullet_speed_level++;
            this.money -= 500;
            this.max_bullet_speed_level = 600;
            this.player.turret.bulletGroup.nextShotTime = 600;
            this.player.turret.bulletGroup.shotDelay = 600;
        }
        else if (this.money >= 1000 && this.bullet_speed_level == 2) {
            this.bullet_speed_level++;
            this.money -= 1000;
            this.max_bullet_speed_level = 400;
            this.player.turret.bulletGroup.nextShotTime = 400;
            this.player.turret.bulletGroup.shotDelay = 400;
        }
        this.button_upgrade_bullet_speed_level.setText(`(BULLET SPEED LEVEL ${this.bullet_speed_level} / 3)`);
    }

    updateUpgradeRotationSpeedButtonText() {
        if (this.money >= 300 && this.rotation_speed_level == 0) {
            this.rotation_speed_level++;
            this.money -= 300;
            this.max_rotation_speed_level = 0.07;
            this.player.tank_rotation_speed = 0.07;
        }
        else if (this.money >= 500 && this.rotation_speed_level == 1) {
            this.rotation_speed_level++;
            this.money -= 500;
            this.max_rotation_speed_level = 0.09;
            this.player.tank_rotation_speed = 0.09;
        }
        else if (this.money >= 1000 && this.rotation_speed_level == 2) {
            this.rotation_speed_level++;
            this.money -= 1000;
            this.max_rotation_speed_level = 0.11;
            this.player.tank_rotation_speed = 0.11;
        }
        this.button_upgrade_rotation_speed_level.setText(`(ROTATION SPEED LEVEL ${this.rotation_speed_level} / 3)`);
    }

    updateUpgradeMovementSpeedButtonText() {
        if (this.money >= 300 && this.movement_speed_level == 0) {
            this.movement_speed_level++;
            this.money -= 300;
            this.max_movement_speed_level = 5;
            this.player.tank_velocity = 5;
        }
        else if (this.money >= 500 && this.movement_speed_level == 1) {
            this.movement_speed_level++;
            this.money -= 500;
            this.max_movement_speed_level = 7;
            this.player.tank_velocity = 7;
        }
        else if (this.money >= 1000 && this.movement_speed_level == 2) {
            this.movement_speed_level++;
            this.money -= 1000;
            this.max_movement_speed_level = 10;
            this.player.tank_velocity = 10;
        }
        this.button_upgrade_movement_speed.setText(`(MOVEMENT SPEED LEVEL ${this.movement_speed_level} / 3)`);
    }

    updateUpgradeHpButtonText() {
        if (this.money >= 300 && this.hp_level == 0) {
            this.hp_level++;
            this.money -= 300;
            this.max_level_hp = 300;
            this.player.tank_HP = 300;
        }
        else if (this.money >= 500 && this.hp_level == 1) {
            this.hp_level++;
            this.money -= 500;
            this.max_level_hp = 500;
            this.player.tank_HP = 500;
        }
        else if (this.money >= 1000 && this.hp_level == 2) {
            this.hp_level++;
            this.money -= 1000;
            this.max_level_hp = 1000;
            this.player.tank_HP = 1000;
        }
        this.button_upgrade_hp_text.setText(`(HP LEVEL ${this.hp_level} / 3)`);
    }

    spawnDiamonds(scene, quantity) {
        scene.diamonds = new Array(quantity);
        for (let i = 0; i < quantity; i++) {
            let x = -2000;
            let y = -2000;
            const diamond = new Diamond(this, x, y);
            scene.diamonds[i] = diamond;
        }
        console.log(scene.diamonds);
    }

    spawnEnemies(scene) {
        scene.enemies = new Array(this.iloscWrogow);
        for (let i = 0; i < this.iloscWrogow; i++) {
            const enemy = new Tank(this, -2000, -2000, "turret", "tank", "anim_enemy_tank_move", "enemyTankAtlas");
            enemy.tank.setActive(false);
            enemy.tank.setVisible(false);
            enemy.active = false;
            scene.enemies[i] = enemy;
        }
    }
    nextSpawnTime1 = 3000;
    spawnDelay1 = 5000;
    showEnemy() {
        if (this.nextSpawnTime1 < this.time.now) {
            this.nextSpawnTime1 = this.time.now + this.spawnDelay1;

            for (let i = 0; i < this.iloscWrogow; i++) {
                if (this.enemies[i].active === false) {
                    console.log(this.enemies[i])

                    let x = Phaser.Math.Between(200, 1400);
                    let y = Phaser.Math.Between(200, 1000);
                    this.enemies[i].active = true;
                    this.enemies[i].tank.setActive(true);
                    this.enemies[i].tank.setVisible(true);
                    this.enemies[i].tank.body.setEnable(true);
                    this.enemies[i].turret.turret.setActive(true);
                    this.enemies[i].turret.turret.setVisible(true);
                    this.enemies[i].turret.turret.body.setEnable(true);
                    this.enemies[i].tank.x = x;
                    this.enemies[i].tank.y = y;

                    this.enemies[i].turret.turret.x = x;
                    this.enemies[i].turret.turret.y = y;

                    this.enemies[i].follow_flag = true;
                    break;
                }
            }
        }
    }

    nextSpawnTime2 = 5000;
    spawnDelay2 = 10000;
    showDiamonds() {
        if (this.nextSpawnTime2 < this.time.now) {
            this.nextSpawnTime2 = this.time.now + this.spawnDelay2;

            for (let i = 0; i < this.quantity; i++) {
                if (this.diamonds[i].active === false) {
                    console.log(this.diamonds[i])

                    let x = Phaser.Math.Between(200, 1400);
                    let y = Phaser.Math.Between(200, 1000);
                    this.diamonds[i].active = true;
                    this.diamonds[i].diamond.setActive(true);
                    this.diamonds[i].diamond.setVisible(true);
                    this.diamonds[i].diamond.body.setEnable(true);
                    this.diamonds[i].diamond.x = x;
                    this.diamonds[i].diamond.y = y;

                    break;
                }
            }
        }
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

        this.showEnemy();

        //AI
        for (let i = 0; i < this.iloscWrogow; i++) {
            if (this.enemies[i].active === true) {
                this.enemies[i].animation(true);
                this.enemies[i].followPlayer();
            }
        }

        // Text
        this.updateText();

        // Diamond
        for (let i = 0; i < 10; i++) {
            this.diamonds[i].animation(true);
            this.diamonds[i].canCollide();
        }
        this.showDiamonds();

        // Collisions
        for (let i = 0; i < 10; i++) {
            this.physics.collide(this.enemies[i].tank, this.player.turret.bulletGroup, () => this.disableObject(this.enemies[i]));
            this.physics.overlap(this.player.tank, this.enemies[i].turret.bulletGroup, () => this.tankColide(this.player, this.enemies[i].turret.bulletGroup));
            this.physics.overlap(this.enemies[i].tank, this.player.turret.bulletGroup, () => this.tankColide(this.enemies[i], this.player.turret.bulletGroup));
            this.physics.collide(this.enemies[i].tank, this.player.tank, () => this.tankColide2(this.enemies[i], this.player));
        }
    }
    tankColide(object, pocisk) {
        object.hit();
        pocisk.disable();
        console.log(object.tank_HP);
        if (object.tank_HP < 0) {
            this.disableObject(object)
        }
    }
    tankColide2(tank1, tank2) {
        for (let i = 0; i < 1; i++) {
            tank1.tankRotation(false)
            tank2.tankRotation(false)
        };
    }
    disableObject(object) {
        object.disable();
        this.money += 100;
    }
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
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: OurScene
};

game = new Phaser.Game(config);
