import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 180;
        this.setFrame(0);
        this.setScale(0.6);
        this.setCollideWorldBounds(true);
    }

    move(cursors, keys) {
        this.body.setVelocity(0);

        const speed = 160;
        let moving = false;

        if (cursors.left.isDown || keys.left.isDown) {
            this.body.setVelocityX(-speed);
            this.setFlipX(true);
            this.play("walk-side", true);
            moving = true;
        } else if (cursors.right.isDown || keys.right.isDown) {
            this.body.setVelocityX(speed);
            this.setFlipX(false);
            this.play("walk-side", true);
            moving = true;
        }

        if (cursors.up.isDown || keys.up.isDown) {
            this.body.setVelocityY(-speed);
            this.play("walk-down", true);
            moving = true;
        } else if (cursors.down.isDown || keys.down.isDown) {
            this.body.setVelocityY(speed);
            this.play("walk-down", true);
            moving = true;
        }

        this.body.velocity.normalize().scale(speed);

        if (!moving) {
            this.play("idle-down", true);
        }
    }
}