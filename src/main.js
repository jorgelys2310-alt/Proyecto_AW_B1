// Importa la librería principal de Phaser
import Phaser from "phaser";

// Importa las escenas del juego
import GameScene from "./scenes/GameScene.js";
import MenuScene from "./scenes/MenuScene.js";

// Configuración principal del juego
const config = {
    // Phaser decidirá automáticamente si usa WebGL o Canvas
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    // Contenedor HTML donde se mostrará el juego
    parent: "game-container",
    // Color de fondo del juego
    backgroundColor: "#1d2b1f",
    // Configuración del sistema de físicas
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    // Escenas que forman parte del juego
    // Primero se carga el menú y luego la escena principal
    scene: [MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Crear una nueva instancia del juego con la configuración definida
new Phaser.Game(config);