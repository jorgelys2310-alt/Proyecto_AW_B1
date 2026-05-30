// Importa Phaser para poder usar sus clases y funcionalidades
import Phaser from "phaser";

/**
 * Clase Player.
 *
 * Representa al personaje principal controlado por el jugador.
 * Hereda de Phaser.Physics.Arcade.Sprite, lo que permite que el personaje
 * tenga físicas, colisiones, velocidad y animaciones.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    
    /**
     * Constructor del jugador.
     *
     * Se encarga de crear el sprite del jugador, agregarlo a la escena,
     * activar sus físicas y configurar sus propiedades iniciales.
     *
     * @param {Phaser.Scene} scene - Escena donde se crea el jugador.
     * @param {number} x - Posición inicial en el eje X.
     * @param {number} y - Posición inicial en el eje Y.
     * @param {string} texture - Clave de la textura o spritesheet del jugador.
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // Agrega el jugador visualmente a la escena
        scene.add.existing(this);

        // Activa el sistema de físicas Arcade para el jugador
        scene.physics.add.existing(this);

        // Velocidad base del jugador
        this.speed = 180;

        // Define el frame inicial del sprite
        this.setFrame(0);

        // Ajusta el tamaño visual del personaje
        this.setScale(0.6);

        // Evita que el jugador salga de los límites del mundo
        this.setCollideWorldBounds(true);
    }

    /**
     * Controla el movimiento del jugador.
     *
     * Este método revisa las teclas presionadas y mueve al jugador
     * hacia la izquierda, derecha, arriba o abajo. También reproduce
     * las animaciones correspondientes según la dirección del movimiento.
     *
     * @param {object} cursors - Controles de flechas del teclado.
     * @param {object} keys - Controles alternativos, por ejemplo WASD.
     */
    move(cursors, keys) {
        // Reinicia la velocidad antes de calcular el nuevo movimiento
        this.body.setVelocity(0);

        // Velocidad usada para mover al jugador
        const speed = 160;

        // Indica si el jugador se está moviendo
        let moving = false;

        // Movimiento hacia la izquierda
        if (cursors.left.isDown || keys.left.isDown) {
            this.body.setVelocityX(-speed);

            // Voltea el sprite hacia la izquierda
            this.setFlipX(true);

            // Reproduce la animación lateral
            this.play("walk-side", true);

            moving = true;

        // Movimiento hacia la derecha
        } else if (cursors.right.isDown || keys.right.isDown) {
            this.body.setVelocityX(speed);

            // Mantiene el sprite mirando hacia la derecha
            this.setFlipX(false);

            // Reproduce la animación lateral
            this.play("walk-side", true);

            moving = true;
        }

        // Movimiento hacia arriba
        if (cursors.up.isDown || keys.up.isDown) {
            this.body.setVelocityY(-speed);

            // Reproduce la animación de caminar
            this.play("walk-down", true);

            moving = true;

        // Movimiento hacia abajo
        } else if (cursors.down.isDown || keys.down.isDown) {
            this.body.setVelocityY(speed);

            // Reproduce la animación de caminar hacia abajo
            this.play("walk-down", true);

            moving = true;
        }

        // Normaliza la velocidad para evitar que el jugador sea más rápido en diagonal
        this.body.velocity.normalize().scale(speed);

        // Si no hay movimiento, reproduce la animación de reposo
        if (!moving) {
            this.play("idle-down", true);
        }
    }
}