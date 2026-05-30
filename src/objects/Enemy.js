import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;

        this.patrolSpeed = 45;
        this.chaseSpeed = 110;
        this.direction = 1;
        this.detectionRange = 220;

        this.setScale(0.55);
        this.body.setSize(40, 60);
        this.body.setOffset(28, 50);
        this.setCollideWorldBounds(true);
    }

    update(player) {
        const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            player.x,
            player.y
        );

        if (distance <= this.detectionRange) {
            this.scene.physics.moveToObject(
                this,
                player,
                this.chaseSpeed
            );

            this.anims.play("enemy-walk", true);

            this.setFlipX(player.x < this.x);
            return;
        }

        this.setVelocityX(this.patrolSpeed * this.direction);
        this.setVelocityY(0);

        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(false);
        }

        if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(true);
        }

        this.anims.play("enemy-walk", true);
    }
}