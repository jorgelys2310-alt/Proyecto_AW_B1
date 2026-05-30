import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";
import MenuScene from "./scenes/MenuScene.js";

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: "game-container", 
    backgroundColor: "#1d2b1f",
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);