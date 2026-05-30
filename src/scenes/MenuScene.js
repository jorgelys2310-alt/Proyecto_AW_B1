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
        this.add.image(480, 270, "menu_bg")
            .setDisplaySize(960, 540);

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

        const startText = this.add.text(480, 310, "▶ PRESIONA ENTER PARA INICIAR", {
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

        this.input.keyboard.once("keydown-ENTER", () => {
            this.scene.start("GameScene");
        });
    }
}