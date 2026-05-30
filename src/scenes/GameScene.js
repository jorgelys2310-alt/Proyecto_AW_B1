import Phaser from "phaser";
import Player from "../objects/Player.js";
import Enemy from "../objects/Enemy.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.tilemapTiledJSON("nave", "/assets/map/nave.json");

        this.load.image(
            "scifi_tiles",
            "/assets/map/tilesets/ScifiTilemap_64x64_v3.png"
        );

        this.load.spritesheet("player", "/assets/player/player.png", {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet("enemy", "/assets/enemies/robot.png", {
            frameWidth: 96,
            frameHeight: 128
        });

        this.load.image("fusible", "/assets/items/fusible.png");
    }

    create() {
        this.fusiblesRecolectados = 0;
        this.maxFusibles = 2;
        this.fusiblesPorOleada = 3;

        this.playerHealth = 3;
        this.maxHealth = 3;
        this.lastHit = 0;
        this.playerInvulnerable = false;
        this.medkits = [];

        this.consoles = [];
        this.doors = {};
        this.currentConsole = null;

        this.consolasNormalesCompletadas = 0;
        this.consolasGlobalesCompletadas = 0;
        this.gameWon = false;

        this.unlockedFusibleZones = ["Fusible"];

        this.isGameOver = false;
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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
            if (obj.name.startsWith("console_")) {
                this.createConsole(obj);
            }

            if (
                obj.name.startsWith("Puerta_") ||
                obj.name.startsWith("door_")
            ) {
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

        this.isPaused = false;

        this.keyESC = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.keyF = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        this.currentMedkit = null;
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

        this.healthText = this.add.text(
            10,
            40,
            "❤️❤️❤️",
            {
                fontSize: "20px"
            }
        );

        this.healthText.setDepth(9999);

        this.interactText = this.add.text(480, 500, "", {
            fontSize: "18px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 8, y: 4 }
        });

        this.winText = this.add.text(480, 250, "", {
            fontSize: "24px",
            fill: "#00ffff",
            backgroundColor: "#000000",
            padding: { x: 12, y: 8 }
        });

        //PANTALLA GAME OVER
        this.gameOverPanel = this.add.container(480, 270);
        this.gameOverPanel.setDepth(9999);
        this.gameOverPanel.setVisible(false);

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

        const restart = this.add.text(0, 80, "PRESIONA R PARA REINICIAR", {
            fontSize: "22px",
            fill: "#ff3333",
            fontFamily: "monospace"
        }).setOrigin(0.5);

        this.gameOverPanel.add([bg, title, msg, restart]);


        //PANTALLA VICTORIA
        this.victoryPanel = this.add.container(480, 270);
        this.victoryPanel.setDepth(9999);
        this.victoryPanel.setVisible(false);

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

        const victoryRestart = this.add.text(
            0,
            95,
            "PRESIONA R PARA JUGAR DE NUEVO",
            {
                fontSize: "22px",
                fill: "#00ffff",
                fontFamily: "monospace"
            }
        ).setOrigin(0.5);

        this.victoryPanel.add([
            victoryBg,
            victoryTitle,
            victoryMsg,
            victoryRestart
        ]);

        //Panel de Pausa
        this.pausePanel = this.add.container(480, 270);
        this.pausePanel.setDepth(9999);
        this.pausePanel.setVisible(false);

        const pauseBg = this.add.rectangle(0, 0, 520, 240, 0x000000, 0.9);
        pauseBg.setStrokeStyle(4, 0x00ffff);

        const pauseTitle = this.add.text(0, -55, "⏸ PAUSA", {
            fontSize: "42px",
            fill: "#00ffff",
            fontFamily: "monospace",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const pauseMsg = this.add.text(0, 25, "ESC - Continuar\nR - Reiniciar", {
            fontSize: "22px",
            fill: "#ffffff",
            fontFamily: "monospace",
            align: "center"
        }).setOrigin(0.5);

        this.pausePanel.add([pauseBg, pauseTitle, pauseMsg]);

        this.interactText.setOrigin(0.5);
        this.interactText.setVisible(false);

        this.winText.setOrigin(0.5);
        this.winText.setVisible(false);

        this.fusibleText.setDepth(9999);
        this.interactText.setDepth(9999);
        this.winText.setDepth(9999);

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
            this.interactText,
            this.winText,
            this.healthText,
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

        door.doorId = doorId;
        this.doors[doorId] = door;

        this.physics.add.collider(this.player, door);
    }

    createMedkit(obj) {
        const medkit = this.add.zone(
            obj.x,
            obj.y,
            64,
            64
        );

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

            const distance =
                Phaser.Math.Distance.Between(
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
        if (!medkit) return;

        if (medkit.uses <= 0) return;

        if (this.playerHealth >= this.maxHealth) {
            console.log("Vida completa");
            return;
        }

        this.playerHealth++;

        medkit.uses--;

        this.updateHearts();

        console.log(
            `Botiquín usado (${medkit.uses} usos restantes)`
        );

        if (medkit.uses <= 0) {

            const index =
                this.medkits.indexOf(medkit);

            if (index !== -1) {
                this.medkits.splice(index, 1);
            }

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
                    this.fusiblesRecolectados++;

                    this.fusibleText.setText(
                        `Fusibles: ${this.fusiblesRecolectados}/${this.maxFusibles}`
                    );
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

        this.fusibleText.setText(
            `Fusibles: ${this.fusiblesRecolectados}/${this.maxFusibles}`
        );

        if (consoleObj.progress >= consoleObj.requiredFusibles) {
            consoleObj.repaired = true;

            if (consoleObj.consoleType === "normal") {
                this.consolasNormalesCompletadas++;

                const door = this.doors[consoleObj.consoleId];

                if (door) {
                    door.destroy();
                    console.log(`Puerta_${consoleObj.consoleId} abierta`);
                }

                const nuevaZona = `Fusible${consoleObj.consoleId}`;

                if (!this.unlockedFusibleZones.includes(nuevaZona)) {
                    this.unlockedFusibleZones.push(nuevaZona);
                }
            }

            if (consoleObj.consoleType === "global") {
                this.consolasGlobalesCompletadas++;

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

        this.updateHearts();

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
        this.healthText.setText(
            "❤️".repeat(this.playerHealth)
        );
    }

    showGameOver() {
        this.isGameOver = true;
        this.player.body.setVelocity(0);
        this.gameOverPanel.setVisible(true);
    }

    showVictory() {
        this.gameWon = true;
        this.player.body.setVelocity(0);
        this.victoryPanel.setVisible(true);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
            this.isPaused = !this.isPaused;
            this.pausePanel.setVisible(this.isPaused);

            if (this.isPaused) {
                this.player.body.setVelocity(0);
                this.enemiesGroup.getChildren().forEach(enemy => {
                    enemy.body.setVelocity(0);
                });
                this.physics.world.pause();
            } else {
                this.physics.world.resume();
            }
        }

        if (this.isPaused) {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this.physics.world.resume();
                this.scene.restart();
            }
            return;
        }

        if (this.gameWon) {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this.scene.restart();
            }
            return;
        }

        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
                this.scene.restart();
            }
            return;
        }

        if (this.gameWon) return;

        this.player.move(this.cursors, this.keys);

        this.enemiesGroup.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        this.currentConsole = this.getNearbyConsole();

        if (this.currentConsole) {
            this.interactText.setVisible(true);

            if (this.currentConsole.repaired) {
                this.interactText.setText("Consola reparada");
            } else if (
                this.currentConsole.consoleType === "global" &&
                this.consolasNormalesCompletadas < 3
            ) {
                this.interactText.setText(
                    "Repara primero las 3 consolas principales"
                );
            } else {
                this.interactText.setText(
                    `Presiona E para reparar (${this.currentConsole.progress}/3)`
                );
            }
        } else {
            this.interactText.setVisible(false);
            this.interactText.setText("");
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.keyE) &&
            this.currentConsole
        ) {
            this.repairConsole(this.currentConsole);
        }

        this.currentMedkit = this.getNearbyMedkit();
        if (this.currentMedkit) {

            this.interactText.setVisible(true);

            this.interactText.setText(
                `F - Usar botiquín (${this.currentMedkit.uses}/2)`
            );
        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keyF
            ) &&
            this.currentMedkit
        ) {

            this.useMedkit(
                this.currentMedkit
            );
        }

    }
}