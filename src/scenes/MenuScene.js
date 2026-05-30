import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        this.load.image(
            "menu_bg",
            "/assets/ui/menu_bg.png"
        );
    }

    create() {
        const highScore = localStorage.getItem("highScore") || 0;

        this.add.image(480, 270, "menu_bg").setDisplaySize(960, 540);

        this.add.rectangle(480, 270, 960, 540, 0x000000, 0.55);

        this.add.text(480, 120, "ÚLTIMO TRIPULANTE", {
            fontSize: "46px",
            fill: "#00ffff",
            fontFamily: "monospace",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(480, 200, "La nave fue atacada. Sobrevive, repara y escapa.", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "monospace"
        }).setOrigin(0.5);

        const scoreText = this.add.text(
            480,
            250,
            `🏆 Récord: ${highScore}`,
            {
                fontSize: "22px",
                fill: "#FFD700",
                fontFamily: "monospace",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: scoreText,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        const isTouchDevice = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
        const startLabel = isTouchDevice ? "▶ TOCA LA PANTALLA PARA INICIAR" : "▶ PRESIONA ENTER PARA INICIAR";

        const startText = this.add.text(480, 310, startLabel, {
            fontSize: "24px",
            fill: "#ff3333",
            fontFamily: "monospace"
        }).setOrigin(0.5);

        this.add.text(480, 380, "WASD/Flechas: Mover | E: Reparar | F: Botiquín", {
            fontSize: "16px",
            fill: "#cccccc",
            fontFamily: "monospace"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        const isMobile = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

        const startGame = () => {
            // Fullscreen + bloqueo de orientación (Chrome Android lo soporta)
            if (isMobile && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
                    .then(() => {
                        if (screen.orientation?.lock) {
                            screen.orientation.lock("landscape").catch(() => {});
                        }
                    })
                    .catch(() => {});
            }
            this.scene.start("GameScene");
        };

        this.input.keyboard.once("keydown-ENTER", startGame);

        // Esperar 800 ms antes de habilitar el toque para evitar que el tap
        // con el que el usuario abrió la URL en el navegador dispare el inicio.
        this.time.delayedCall(800, () => {
            this.input.once("pointerdown", startGame);
        });
    }
}