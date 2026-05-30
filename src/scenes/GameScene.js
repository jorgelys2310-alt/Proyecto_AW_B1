import Phaser from "phaser";
import Player from "../objects/Player.js";
import Enemy from "../objects/Enemy.js";
import ResponsiveManager from "../managers/ResponsiveManager.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        const cx = this.scale.width  / 2;
        const cy = this.scale.height / 2;
        const W  = Math.min(this.scale.width * 0.6, 380);

        const loadBg = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x1d2b1f);

        const loadLabel = this.add.text(cx, cy - 60, "Cargando nave...", {
            fontSize: "20px", fill: "#00ffff", fontFamily: "monospace"
        }).setOrigin(0.5);

        const box = this.add.graphics();
        box.fillStyle(0x111111, 0.9);
        box.fillRect(cx - W / 2 - 4, cy - 28, W + 8, 56);

        const bar = this.add.graphics();
        const pct = this.add.text(cx, cy, "0%", {
            fontSize: "16px", fill: "#ffffff", fontFamily: "monospace"
        }).setOrigin(0.5);

        this.load.on("progress", (v) => {
            bar.clear();
            bar.fillStyle(0x00ffff, 1);
            bar.fillRect(cx - W / 2, cy - 24, W * v, 48);
            pct.setText(Math.floor(v * 100) + "%");
        });

        this.load.on("complete", () => {
            loadBg.destroy();
            box.destroy();
            bar.destroy();
            pct.destroy();
            loadLabel.destroy();
        });

        this.load.tilemapTiledJSON("nave", "/assets/map/nave.json");
        this.load.image("scifi_tiles", "/assets/map/tilesets/ScifiTilemap_64x64_v3.png");

        this.load.spritesheet("player", "/assets/player/player.png", {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet("enemy", "/assets/enemies/robot.png", {
            frameWidth: 96,
            frameHeight: 128
        });

        this.load.image("fusible", "/assets/items/fusible.png");

        // El toque en MenuScene desbloquea el AudioContext de Safari antes de llegar aquí
        this.load.audio("music",     "/assets/audio/music.mp3");
        this.load.audio("door_open", "/assets/audio/door_open.wav");
        this.load.audio("gameover",  "/assets/audio/gameover.wav");
        this.load.audio("pickup",    "/assets/audio/pickup.wav");
        this.load.audio("hit",       "/assets/audio/hit.wav");
        this.load.audio("repair",    "/assets/audio/repair.wav");
        this.load.audio("victory",   "/assets/audio/victory.wav");
    }

    create() {
        this.score = 0;
        this.highScore = Number(localStorage.getItem("highScore")) || 0;

        this.fusiblesRecolectados = 0;
        this.maxFusibles = 2;
        this.fusiblesPorOleada = 3;

        this.playerHealth = 3;
        this.maxHealth = 3;
        this.playerInvulnerable = false;
        this.medkits = [];

        this.consoles = [];
        this.doors = {};
        this.currentConsole = null;
        this.currentMedkit = null;

        this.consolasNormalesCompletadas = 0;
        this.consolasGlobalesCompletadas = 0;

        this.gameWon = false;
        this.isGameOver = false;
        this.isPaused = false;


        this.unlockedFusibleZones = ["Fusible"];


        const map = this.make.tilemap({ key: "nave" });
        const tileset = map.addTilesetImage("scifi_tiles", "scifi_tiles");

        const floorLayer = map.createLayer("Floor", tileset, 0, 0);
        const wallsLayer = map.createLayer("Walls", tileset, 0, 0);
        const collisionLayer = map.createLayer("Colision", tileset, 0, 0);
        const objectsLayer = map.createLayer("Objects", tileset, 0, 0);

        collisionLayer.setCollisionByExclusion([-1]);
        collisionLayer.setVisible(false);

        this.createPlayerAnimations();
        this.createEnemyAnimations();

        this.player = new Player(this, 480, 270, "player");
        this.player.setScale(0.9);
        this.player.body.setSize(24, 28);
        this.player.body.setOffset(20, 30);

        this.physics.add.collider(this.player, collisionLayer);

        this.enemiesGroup = this.physics.add.group();

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.7);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.createHUD(floorLayer, wallsLayer, collisionLayer, objectsLayer);

        const interactables = map.getObjectLayer("Interactables");

        this.fusiblesGroup = this.physics.add.group();

        this.fusiblePositions = interactables.objects.filter(obj =>
            obj.name.startsWith("Fusible")
        );

        interactables.objects.forEach(obj => {
            if (obj.name.startsWith("console_")) this.createConsole(obj);

            if (obj.name.startsWith("Puerta_") || obj.name.startsWith("door_")) {
                this.createDoor(obj);
            }

            if (obj.name === "Enemy") {
                const enemy = new Enemy(this, obj.x, obj.y);
                this.enemiesGroup.add(enemy);

                this.physics.add.collider(enemy, collisionLayer);

                this.physics.add.overlap(
                    this.player,
                    enemy,
                    this.damagePlayer,
                    null,
                    this
                );
            }

            if (obj.name === "Botiquin") {
                this.createMedkit(obj);
            }
        });

        this.spawnFusibles();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D"
        });

        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.isMuted = localStorage.getItem("muted") === "true";

        this.music = this.cache.audio.has("music")
            ? this.sound.add("music", { loop: true, volume: 0.35 })
            : null;

        this.gameOverSound = this.cache.audio.has("gameover")
            ? this.sound.add("gameover")
            : null;

        this.victorySound = this.cache.audio.has("victory")
            ? this.sound.add("victory")
            : null;

        if (this.music && !this.music.isPlaying) {
            this.music.play();
        }
        this.sound.mute = this.isMuted;

        this.keyM = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.M
        );

        this.responsive = new ResponsiveManager(this);

        // Reposicionar joystick/botones cuando el layout ya está listo
        this.time.delayedCall(100, () => this.responsive._reposition());

        this.scale.on("resize", (gameSize) => {
            if (this.hudCamera) {
                this.hudCamera.setSize(gameSize.width, gameSize.height);
            }
            const cx = gameSize.width / 2;
            const cy = gameSize.height / 2;
            this.gameOverPanel.setPosition(cx, cy);
            this.victoryPanel.setPosition(cx, cy);
            this.pausePanel.setPosition(cx, cy);
            this.interactText.setPosition(cx, gameSize.height - 40);
        });
    }

    createPlayerAnimations() {
        this.anims.create({
            key: "idle-down",
            frames: [{ key: "player", frame: 0 }],
            frameRate: 1
        });

        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("player", {
                start: 8,
                end: 11
            }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "walk-side",
            frames: this.anims.generateFrameNumbers("player", {
                start: 8,
                end: 11
            }),
            frameRate: 6,
            repeat: -1
        });
    }

    createEnemyAnimations() {
        this.anims.create({
            key: "enemy-walk",
            frames: this.anims.generateFrameNumbers("enemy", {
                start: 36,
                end: 39
            }),
            frameRate: 6,
            repeat: -1
        });
    }

    createHUD(floorLayer, wallsLayer, collisionLayer, objectsLayer) {
        this.fusibleText = this.add.text(10, 10, "Fusibles: 0/2", {
            fontSize: "16px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 6, y: 4 }
        });

        this.healthText = this.add.text(10, 40, "❤️❤️❤️", {
            fontSize: "20px"
        });

        this.scoreText = this.add.text(10, 70, `Puntaje: ${this.score}`, {
            fontSize: "16px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 6, y: 4 }
        });

        this.highScoreText = this.add.text(10, 100, `Récord: ${this.highScore}`, {
            fontSize: "16px",
            fill: "#00ffff",
            backgroundColor: "#000000",
            padding: { x: 6, y: 4 }
        });

        this.interactText = this.add.text(480, 500, "", {
            fontSize: "18px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setVisible(false);

        this.gameOverPanel = this.add.container(480, 270).setDepth(9999).setVisible(false);
        const bg = this.add.rectangle(0, 0, 620, 300, 0x050505, 0.95);
        bg.setStrokeStyle(4, 0xff0000);
        const title = this.add.text(0, -90, "☠ GAME OVER ☠", {
            fontSize: "56px",
            fill: "#ff2222",
            fontFamily: "monospace",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const msg = this.add.text(0, -15, "⚠ La estación ha caído ⚠\nInténtalo de nuevo.", {
            fontSize: "22px",
            fill: "#dddddd",
            fontFamily: "monospace",
            align: "center"
        }).setOrigin(0.5);
        const isMobile = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
        const restart = this.add.text(0, 80,
            isMobile ? "TOCA LA PANTALLA PARA REINICIAR" : "PRESIONA R PARA REINICIAR", {
            fontSize: "20px",
            fill: "#ff3333",
            fontFamily: "monospace"
        }).setOrigin(0.5);
        this.gameOverPanel.add([bg, title, msg, restart]);

        this.victoryPanel = this.add.container(480, 270).setDepth(9999).setVisible(false);
        const victoryBg = this.add.rectangle(0, 0, 680, 320, 0x031f1f, 0.95);
        victoryBg.setStrokeStyle(4, 0x00ffff);
        const victoryTitle = this.add.text(0, -95, "🏆 MISIÓN COMPLETADA 🏆", {
            fontSize: "38px",
            fill: "#00ffff",
            fontFamily: "monospace",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const victoryMsg = this.add.text(
            0,
            -15,
            "🚀 Sistema de navegación restaurado\nLa nave vuelve a estar operativa.",
            {
                fontSize: "22px",
                fill: "#ffffff",
                fontFamily: "monospace",
                align: "center"
            }
        ).setOrigin(0.5);
        const victoryRestart = this.add.text(0, 95,
            isMobile ? "TOCA LA PANTALLA PARA JUGAR DE NUEVO" : "PRESIONA R PARA JUGAR DE NUEVO", {
            fontSize: "20px",
            fill: "#00ffff",
            fontFamily: "monospace"
        }).setOrigin(0.5);
        this.victoryPanel.add([victoryBg, victoryTitle, victoryMsg, victoryRestart]);

        this.pausePanel = this.add.container(480, 270).setDepth(9999).setVisible(false);
        const pauseBg = this.add.rectangle(0, 0, 520, 240, 0x000000, 0.9);
        pauseBg.setStrokeStyle(4, 0x00ffff);
        const pauseTitle = this.add.text(0, -55, "⏸ PAUSA", {
            fontSize: "42px",
            fill: "#00ffff",
            fontFamily: "monospace",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const pauseMsg = this.add.text(0, 25,
            isMobile ? "TOCA PARA CONTINUAR\nR - Reiniciar" : "ESC - Continuar\nR - Reiniciar", {
            fontSize: "22px",
            fill: "#ffffff",
            fontFamily: "monospace",
            align: "center"
        }).setOrigin(0.5);
        this.pausePanel.add([pauseBg, pauseTitle, pauseMsg]);

        [
            this.fusibleText,
            this.healthText,
            this.scoreText,
            this.highScoreText,
            this.interactText
        ].forEach(item => item.setDepth(9999));

        this.hudCamera = this.cameras.add(0, 0, 960, 540);
        this.hudCamera.setScroll(0, 0);

        this.hudCamera.ignore([
            floorLayer,
            wallsLayer,
            collisionLayer,
            objectsLayer,
            this.player
        ]);

        this.cameras.main.ignore([
            this.fusibleText,
            this.healthText,
            this.scoreText,
            this.highScoreText,
            this.interactText,
            this.gameOverPanel,
            this.victoryPanel,
            this.pausePanel
        ]);
    }

    createConsole(obj) {
        const zone = this.add.zone(obj.x, obj.y, 90, 90);
        zone.setVisible(false);

        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.moves = false;

        zone.name = obj.name;
        zone.progress = 0;
        zone.repaired = false;
        zone.requiredFusibles = 3;

        if (obj.name.startsWith("console_g")) {
            zone.consoleType = "global";
            zone.consoleId = obj.name.split("_")[2] || String(obj.id);
        } else {
            zone.consoleType = "normal";
            zone.consoleId = obj.name.split("_")[1];
        }

        this.consoles.push(zone);
    }

    createDoor(obj) {
        const doorId = obj.name.split("_")[1];

        const door = this.add.zone(obj.x, obj.y, 64, 64);
        door.setVisible(false);

        this.physics.world.enable(door);
        door.body.setAllowGravity(false);
        door.body.moves = false;

        this.doors[doorId] = door;

        this.physics.add.collider(this.player, door);
    }

    createMedkit(obj) {
        const medkit = this.add.zone(obj.x, obj.y, 64, 64);
        medkit.setVisible(false);

        this.physics.world.enable(medkit);
        medkit.body.setAllowGravity(false);
        medkit.body.moves = false;

        medkit.uses = 2;
        this.medkits.push(medkit);
    }

    getNearbyMedkit() {
        let nearest = null;
        let nearestDistance = 70;

        this.medkits.forEach(medkit => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                medkit.x,
                medkit.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = medkit;
            }
        });

        return nearest;
    }

    useMedkit(medkit) {
        if (!medkit || medkit.uses <= 0) return;

        if (this.playerHealth >= this.maxHealth) {
            console.log("Vida completa");
            return;
        }

        this.playerHealth++;
        medkit.uses--;
        this.updateHearts();

        if (medkit.uses <= 0) {
            const index = this.medkits.indexOf(medkit);
            if (index !== -1) this.medkits.splice(index, 1);
            medkit.destroy();
        }
    }

    spawnFusibles() {
        this.fusiblesGroup.clear(true, true);

        const availableFusibles = this.fusiblePositions.filter(obj =>
            this.unlockedFusibleZones.includes(obj.name)
        );

        const selectedFusibles = Phaser.Utils.Array.Shuffle([...availableFusibles])
            .slice(0, this.fusiblesPorOleada);

        selectedFusibles.forEach(obj => {
            const x = obj.width > 0 ? obj.x + obj.width / 2 : obj.x;
            const y = obj.height > 0 ? obj.y - obj.height / 2 : obj.y;

            const fusible = this.fusiblesGroup.create(x, y, "fusible");
            fusible.setScale(0.08);
            fusible.setDepth(100);

            this.physics.add.overlap(
                this.player,
                fusible,
                () => {
                    if (this.fusiblesRecolectados >= this.maxFusibles) {
                        console.log("Inventario lleno");
                        return;
                    }

                    fusible.destroy();
                    this.playSound("pickup", { volume: 0.6 });
                    this.fusiblesRecolectados++;

                    this.fusibleText.setText(
                        `Fusibles: ${this.fusiblesRecolectados}/${this.maxFusibles}`
                    );

                    this.updateScore(10);
                },
                null,
                this
            );
        });

        if (this.hudCamera) {
            this.hudCamera.ignore(this.fusiblesGroup.getChildren());
            this.hudCamera.ignore(this.enemiesGroup.getChildren());
        }
    }

    getNearbyConsole() {
        let nearestConsole = null;
        let nearestDistance = 90;

        this.consoles.forEach(consoleObj => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                consoleObj.x,
                consoleObj.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestConsole = consoleObj;
            }
        });

        return nearestConsole;
    }

    repairConsole(consoleObj) {
        if (consoleObj.repaired) return;

        if (
            consoleObj.consoleType === "global" &&
            this.consolasNormalesCompletadas < 3
        ) {
            console.log("Debes reparar las 3 consolas principales primero");
            return;
        }

        if (this.fusiblesRecolectados <= 0) {
            console.log("No tienes fusibles");
            return;
        }

        this.fusiblesRecolectados--;
        consoleObj.progress++;
        this.playSound("repair", { volume: 0.7 });

        this.fusibleText.setText(
            `Fusibles: ${this.fusiblesRecolectados}/${this.maxFusibles}`
        );

        if (consoleObj.progress >= consoleObj.requiredFusibles) {
            consoleObj.repaired = true;

            if (consoleObj.consoleType === "normal") {
                this.consolasNormalesCompletadas++;
                this.updateScore(100);

                const door = this.doors[consoleObj.consoleId];

                if (door) {
                    door.destroy();
                    this.updateScore(50);
                    console.log(`Puerta_${consoleObj.consoleId} abierta`);
                    this.playSound("door_open", { volume: 0.7 });
                }

                const nuevaZona = `Fusible${consoleObj.consoleId}`;

                if (!this.unlockedFusibleZones.includes(nuevaZona)) {
                    this.unlockedFusibleZones.push(nuevaZona);
                }
            }

            if (consoleObj.consoleType === "global") {
                this.consolasGlobalesCompletadas++;
                this.updateScore(200);

                if (this.consolasGlobalesCompletadas >= 4) {
                    this.showVictory();
                }
            }

            this.spawnFusibles();
        }
    }

    damagePlayer(player, enemy) {
        if (this.isPaused) return;
        if (this.playerInvulnerable) return;

        this.playerInvulnerable = true;
        this.playerHealth--;

        this.playSound("hit", { volume: 0.7 });

        this.updateHearts();
        this.updateScore(-25);

        const angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        );

        player.body.velocity.x = Math.cos(angle) * 200;
        player.body.velocity.y = Math.sin(angle) * 200;

        this.tweens.add({
            targets: player,
            alpha: 0.2,
            duration: 120,
            yoyo: true,
            repeat: 11
        });

        this.time.delayedCall(1500, () => {
            this.playerInvulnerable = false;
            player.setAlpha(1);
        });

        if (this.playerHealth <= 0) {
            this.showGameOver();
        }
    }

    updateHearts() {
        this.healthText.setText("❤️".repeat(this.playerHealth));
    }

    updateScore(points) {
        this.score += points;

        if (this.score < 0) {
            this.score = 0;
        }

        this.scoreText.setText(`Puntaje: ${this.score}`);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText(`Récord: ${this.highScore}`);
            localStorage.setItem("highScore", this.highScore);
        }
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("highScore", this.highScore);
        }
    }

    _restartGame() {
        this.gameOverSound?.stop();
        this.victorySound?.stop();
        this.music?.stop();
        this.physics.world.resume();
        this.scene.restart();
    }

    playSound(key, config = {}) {
        if (this.cache.audio.has(key)) {
            this.sound.play(key, config);
        }
    }

    showGameOver() {
        this.isGameOver = true;
        this.saveHighScore();
        if (this.music?.isPlaying) this.music.stop();
        this.gameOverSound?.play();
        this.physics.world.pause();
        this.player.body.setVelocity(0);
        this.gameOverPanel.setVisible(true);
        this.input.once("pointerdown", () => this._restartGame());
    }

    showVictory() {
        this.gameWon = true;
        this.updateScore(500);
        this.saveHighScore();
        if (this.music?.isPlaying) this.music.stop();
        this.victorySound?.play();
        this.physics.world.pause();
        this.player.body.setVelocity(0);
        this.victoryPanel.setVisible(true);
        this.input.once("pointerdown", () => this._restartGame());
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
            this.sound.mute = !this.sound.mute;
            localStorage.setItem("muted", this.sound.mute);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyESC) && !this.isGameOver && !this.gameWon) {
            this.isPaused = !this.isPaused;
            this.pausePanel.setVisible(this.isPaused);

            if (this.isPaused) {
                this.player.body.setVelocity(0);
                this.enemiesGroup.getChildren().forEach(e => e.body.setVelocity(0));
                this.physics.world.pause();
                // Toque para reanudar en móvil
                this.input.once("pointerdown", () => {
                    this.isPaused = false;
                    this.pausePanel.setVisible(false);
                    this.physics.world.resume();
                });
            } else {
                this.physics.world.resume();
            }
        }

        if (this.isPaused) {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this._restartGame();
            }
            return;
        }

        if (this.gameWon || this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this._restartGame();
            }
            return;
        }

        const input = this.responsive.getInput(this.cursors, this.keys);
        this.player.move(input, input);

        this.enemiesGroup.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        this.currentConsole = this.getNearbyConsole();
        this.currentMedkit = this.getNearbyMedkit();

        if (this.currentConsole) {
            this.interactText.setVisible(true);

            if (this.currentConsole.repaired) {
                this.interactText.setText("Consola reparada");
            } else if (
                this.currentConsole.consoleType === "global" &&
                this.consolasNormalesCompletadas < 3
            ) {
                this.interactText.setText("Repara primero las 3 consolas principales");
            } else {
                this.interactText.setText(
                    `Presiona E para reparar (${this.currentConsole.progress}/3)`
                );
            }
        } else if (this.currentMedkit) {
            this.interactText.setVisible(true);

            if (this.playerHealth >= this.maxHealth) {
                this.interactText.setText("Botiquín: vida completa");
            } else {
                this.interactText.setText(
                    `F - Usar botiquín (${this.currentMedkit.uses}/2)`
                );
            }
        } else {
            this.interactText.setVisible(false);
            this.interactText.setText("");
        }

        if (
            (Phaser.Input.Keyboard.JustDown(this.keyE) || this.responsive.justPressed("action")) &&
            this.currentConsole
        ) {
            this.repairConsole(this.currentConsole);
        }

        if (
            (Phaser.Input.Keyboard.JustDown(this.keyF) || this.responsive.justPressed("medkit")) &&
            this.currentMedkit
        ) {
            this.useMedkit(this.currentMedkit);
        }
    }
}