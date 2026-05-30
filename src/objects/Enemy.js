// Importa Phaser para usar sus clases, físicas y funciones matemáticas
import Phaser from "phaser";

/**
 * Clase Enemy.
 *
 * Representa a los enemigos del juego.
 * Hereda de Phaser.Physics.Arcade.Sprite, por lo que puede tener físicas,
 * colisiones, velocidad, animaciones y movimiento dentro del mapa.
 *
 * El enemigo tiene dos comportamientos principales:
 * - Patrullar horizontalmente cuando el jugador está lejos.
 * - Perseguir al jugador cuando entra en su rango de detección.
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    /**
     * Constructor del enemigo.
     *
     * Crea el sprite del enemigo, lo agrega a la escena,
     * activa sus físicas y configura sus propiedades iniciales.
     *
     * @param {Phaser.Scene} scene - Escena donde se crea el enemigo.
     * @param {number} x - Posición inicial del enemigo en el eje X.
     * @param {number} y - Posición inicial del enemigo en el eje Y.
     */
    constructor(scene, x, y) {
        // Crea el sprite usando la textura con clave "enemy"
        super(scene, x, y, "enemy");

        // Agrega el enemigo visualmente a la escena
        scene.add.existing(this);

        // Activa las físicas Arcade para el enemigo
        scene.physics.add.existing(this);

        // Guarda una referencia a la escena para usar sus métodos
        this.scene = scene;

        // Velocidad usada cuando el enemigo patrulla
        this.patrolSpeed = 45;

        // Velocidad usada cuando el enemigo persigue al jugador
        this.chaseSpeed = 110;

        // Dirección inicial de patrullaje: 1 derecha, -1 izquierda
        this.direction = 1;

        // Distancia máxima a la que el enemigo detecta al jugador
        this.detectionRange = 220;

        // Ajusta el tamaño visual del enemigo
        this.setScale(0.55);

        // Ajusta el tamaño del cuerpo de colisión
        this.body.setSize(40, 60);

        // Ajusta la posición del cuerpo de colisión respecto al sprite
        this.body.setOffset(28, 50);

        // Evita que el enemigo salga de los límites del mundo
        this.setCollideWorldBounds(true);
    }

    /**
     * Actualiza el comportamiento del enemigo.
     *
     * Este método se ejecuta constantemente desde la escena principal.
     * Primero calcula la distancia entre el enemigo y el jugador.
     *
     * Si el jugador está dentro del rango de detección, el enemigo
     * lo persigue. Si el jugador está fuera del rango, el enemigo
     * patrulla horizontalmente.
     *
     * @param {Player} player - Instancia del jugador.
     */
    update(player) {
        // Calcula la distancia entre el enemigo y el jugador
        const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            player.x,
            player.y
        );

        // Si el jugador está dentro del rango de detección, el enemigo lo persigue
        if (distance <= this.detectionRange) {
            this.scene.physics.moveToObject(
                this,
                player,
                this.chaseSpeed
            );

            // Reproduce la animación de caminar del enemigo
            this.anims.play("enemy-walk", true);

            // Voltea el sprite según la posición del jugador
            this.setFlipX(player.x < this.x);

            // Termina aquí para que no ejecute el patrullaje
            return;
        }

        // Movimiento de patrullaje horizontal cuando el jugador está lejos
        this.setVelocityX(this.patrolSpeed * this.direction);
        this.setVelocityY(0);

        // Si choca con una pared a la izquierda, cambia de dirección a la derecha
        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(false);
        }

        // Si choca con una pared a la derecha, cambia de dirección a la izquierda
        if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(true);
        }

        // Mantiene la animación de caminar durante el patrullaje
        this.anims.play("enemy-walk", true);
    }
}