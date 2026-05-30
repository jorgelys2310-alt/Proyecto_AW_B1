import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() { super("MenuScene"); }
    preload() {}

    create() {
        const W = this.scale.width, H = this.scale.height;
        this._W = W; this._H = H;
        this._state  = "menu";
        this._selIdx = 0;
        this._items  = [];
        this._selGfx = null;
        this._panels = {};
        this._isMob  = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

        this._buildBg(W, H);
        this._buildHexGrid(W, H);
        this._buildNebulae(W, H);
        this._buildPlanet(W, H);
        this._buildStars(W, H);
        this._buildParticles(W, H);
        this._buildShootingStars(W, H);
        this._buildTitle(W, H);
        this._buildStory(W, H);
        this._buildMenu(W, H);
        this._buildPanelRecord(W, H);
        this._buildPanelManual(W, H);
        this._setupInput();

        this.cameras.main.fadeIn(700, 0, 0, 0);
    }

    // ── helpers ────────────────────────────────────────────────────────────
    _fs(H, frac, max) { return Math.min(Math.round(H * frac), max); }

    _frame(g, x, y, w, h, bCol = 0x00ccff, bgCol = 0x000b1a, bgA = 0.93, cSz = 14) {
        g.fillStyle(bgCol, bgA); g.fillRect(x, y, w, h);
        g.lineStyle(1.5, bCol, 0.9); g.strokeRect(x, y, w, h);
        g.lineStyle(2.5, bCol, 1);
        [[x,y,cSz,0,0,cSz],[x+w,y,-cSz,0,0,cSz],[x,y+h,cSz,0,0,-cSz],[x+w,y+h,-cSz,0,0,-cSz]]
            .forEach(([cx,cy,a,b,c,d]) => {
                g.beginPath(); g.moveTo(cx+a,cy+b); g.lineTo(cx,cy); g.lineTo(cx+c,cy+d); g.strokePath();
            });
    }

    _hLine(g, x1, x2, y, col = 0x00ccff, a = 0.2) {
        g.lineStyle(1, col, a); g.beginPath(); g.moveTo(x1,y); g.lineTo(x2,y); g.strokePath();
    }

    // ── fondo ──────────────────────────────────────────────────────────────
    _buildBg(W, H) {
        const g = this.add.graphics();
        g.fillStyle(0x000410); g.fillRect(0, 0, W, H);
        // viñeta radial
        for (let r = 6; r >= 0; r--) {
            g.fillStyle(0x000820, 0.09 * (7 - r));
            g.fillCircle(W * 0.5, H * 0.5, H * (0.4 + r * 0.15));
        }
        g.fillStyle(0x000000, 0.35); g.fillRect(0, 0, W, H * 0.12);
        g.fillStyle(0x000000, 0.35); g.fillRect(0, H * 0.88, W, H * 0.12);
    }

    // ── cuadrícula hex (muy sutil) ─────────────────────────────────────────
    _buildHexGrid(W, H) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x001a33, 0.14);
        const s = Math.round(Math.min(W, H) * 0.052);
        const cols = Math.ceil(W / (s * 1.5)) + 2;
        const rows = Math.ceil(H / (s * 1.732)) + 2;
        const drawHex = (cx, cy) => {
            g.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * 60 - 30) * Math.PI / 180;
                const x = cx + s * Math.cos(a), y = cy + s * Math.sin(a);
                i === 0 ? g.moveTo(x,y) : g.lineTo(x,y);
            }
            g.closePath(); g.strokePath();
        };
        for (let col = -1; col < cols; col++)
            for (let row = -1; row < rows; row++) {
                const x = col * s * 1.5;
                const y = row * s * 1.732 + (col % 2 ? s * 0.866 : 0);
                drawHex(x, y);
            }
    }

    // ── nebulosas más coloridas ────────────────────────────────────────────
    _buildNebulae(W, H) {
        const g = this.add.graphics();
        const blobs = [
            // Rosa/magenta — zona superior derecha
            { x:.78, y:.18, r:170, c:0xcc0066, n:6, aMin:.028, aMax:.040 },
            { x:.88, y:.28, r:110, c:0xff0077, n:4, aMin:.015, aMax:.025 },
            // Azul/teal — zona inferior izquierda
            { x:.12, y:.70, r:145, c:0x003388, n:5, aMin:.035, aMax:.050 },
            { x:.22, y:.82, r: 90, c:0x004466, n:4, aMin:.025, aMax:.040 },
            // Púrpura central
            { x:.50, y:.55, r:120, c:0x220055, n:5, aMin:.020, aMax:.032 },
            // Turquesa sutil
            { x:.70, y:.72, r: 80, c:0x005566, n:3, aMin:.025, aMax:.038 },
            // Rosa claro upper-left
            { x:.18, y:.20, r: 70, c:0x880044, n:3, aMin:.018, aMax:.028 },
        ];
        blobs.forEach(({ x, y, r, c, n, aMin, aMax }) => {
            for (let i = 0; i < n; i++) {
                g.fillStyle(c, aMin + Math.random() * (aMax - aMin));
                g.fillCircle(W*x+(Math.random()-.5)*r*.9, H*y+(Math.random()-.5)*r*.6, r*(.6+Math.random()*.8));
            }
        });
    }

    // ── planeta decorativo ─────────────────────────────────────────────────
    _buildPlanet(W, H) {
        const g = this.add.graphics();
        const pr = Math.min(W, H) * 0.20;
        const px = W * 0.88, py = H * 0.16;   // parcialmente fuera de pantalla

        // Halo atmosférico
        for (let i = 10; i >= 0; i--) {
            g.fillStyle(0x7722cc, 0.013);
            g.fillCircle(px, py, pr + 20 + i * 20);
        }
        g.fillStyle(0xff3388, 0.04); g.fillCircle(px, py, pr + 30);

        // Cuerpo del planeta
        g.fillStyle(0x0d0028); g.fillCircle(px, py, pr);

        // Bandas de superficie
        g.fillStyle(0x220055, 0.65); g.fillEllipse(px-8,  py-18, pr*1.9, pr*0.45);
        g.fillStyle(0x330066, 0.45); g.fillEllipse(px+12, py+12, pr*1.7, pr*0.30);
        g.fillStyle(0x1a0040, 0.55); g.fillEllipse(px-5,  py+30, pr*1.5, pr*0.25);

        // Brillo (fuente de luz desde arriba-izquierda)
        g.fillStyle(0x4422aa, 0.28); g.fillCircle(px - pr*.35, py - pr*.30, pr*0.65);

        // Borde atmosférico (multi-capa)
        g.lineStyle(3, 0xcc44ff, 0.55); g.strokeCircle(px, py, pr);
        g.lineStyle(6, 0x8822bb, 0.20); g.strokeCircle(px, py, pr + 5);
        g.lineStyle(14, 0x440077, 0.08); g.strokeCircle(px, py, pr + 12);

        // Anillos del planeta
        g.lineStyle(2, 0xaa55ff, 0.22); g.strokeEllipse(px, py + 8, pr*3.0, pr*0.55);
        g.lineStyle(1, 0xcc88ff, 0.13); g.strokeEllipse(px, py + 8, pr*3.4, pr*0.62);

        // Animación de brillo del borde
        const glow = this.add.graphics();
        let t = 0;
        this.time.addEvent({ delay:16, loop:true, callback:()=>{
            t += 0.025;
            glow.clear();
            glow.lineStyle(4, 0xcc66ff, 0.10 + Math.sin(t)*0.06);
            glow.strokeCircle(px, py, pr + 2);
        }});
    }

    // ── estrellas ──────────────────────────────────────────────────────────
    _buildStars(W, H) {
        const g = this.add.graphics();
        // Estrellas de fondo (densas)
        for (let i = 0; i < 260; i++) {
            const r = Math.random() < .58 ? .55 : Math.random() < .86 ? 1.0 : 1.7;
            g.fillStyle(0xffffff, .20 + Math.random() * .75);
            g.fillCircle(Math.random()*W, Math.random()*H, r);
        }
        // Estrellas grandes con cruz de brillo
        const big = [[.12,.35],[.45,.08],[.67,.42],[.30,.60],[.82,.55],[.55,.78]];
        big.forEach(([fx,fy]) => {
            const bx = fx*W, by = fy*H;
            const bg2 = this.add.graphics();
            const drawCross = (alpha) => {
                bg2.clear();
                bg2.lineStyle(1, 0xffffff, alpha * 0.6);
                bg2.beginPath(); bg2.moveTo(bx-8,by); bg2.lineTo(bx+8,by); bg2.strokePath();
                bg2.beginPath(); bg2.moveTo(bx,by-8); bg2.lineTo(bx,by+8); bg2.strokePath();
                bg2.fillStyle(0xffffff, alpha); bg2.fillCircle(bx, by, 1.6);
            };
            let ta = 0;
            this.time.addEvent({ delay:16, loop:true, callback:()=>{ ta+=0.03; drawCross(.4+Math.sin(ta)*.35); }});
        });
        // Parpadeo (twinkling)
        for (let i = 0; i < 35; i++) {
            const dot = this.add.graphics();
            const col = [0xffffff,0x88ccff,0xffddbb,0xeeffee][Math.floor(Math.random()*4)];
            dot.fillStyle(col,1); dot.fillCircle(Math.random()*W, Math.random()*H, .7+Math.random()*.9);
            this.tweens.add({ targets:dot, alpha:{from:.08,to:1}, duration:600+Math.random()*3000, yoyo:true, repeat:-1, delay:Math.random()*4000, ease:"Sine.easeInOut" });
        }
    }

    // ── partículas flotantes ───────────────────────────────────────────────
    _buildParticles(W, H) {
        const cols = [0x00aaff, 0xcc44ff, 0x00ffcc, 0xff4488, 0x44aaff, 0xff66cc];
        for (let i = 0; i < 30; i++) {
            const p = this.add.graphics();
            p.fillStyle(cols[Math.floor(Math.random()*cols.length)], 0.75);
            p.fillCircle(0, 0, .5 + Math.random() * .8);
            p.setPosition(Math.random()*W, Math.random()*H);
            this.tweens.add({
                targets:p, y:`-=${70+Math.random()*100}`, x:`+=${(Math.random()-.5)*70}`,
                alpha:{from:.7,to:0}, duration:5000+Math.random()*8000, delay:Math.random()*7000,
                repeat:-1, onRepeat:()=>{ p.setPosition(Math.random()*W, H+5); p.setAlpha(.7); }
            });
        }
    }

    // ── estrellas fugaces ──────────────────────────────────────────────────
    _buildShootingStars(W, H) {
        const shoot = () => {
            const sx = Math.random() * W * 0.6, sy = Math.random() * H * 0.45;
            const len = 90 + Math.random() * 130;
            const s = this.add.graphics();
            s.lineStyle(1.5, 0xffffff, 1);
            s.beginPath(); s.moveTo(0,0); s.lineTo(len, len*0.48); s.strokePath();
            s.fillStyle(0xffffff,1); s.fillCircle(0,0,1.2);
            s.setPosition(sx,sy).setAlpha(0);
            this.tweens.add({ targets:s, x:sx+250, y:sy+120, alpha:{from:0.9,to:0}, duration:500+Math.random()*400, ease:"Power2", onComplete:()=>s.destroy() });
            this.time.addEvent({ delay:4000+Math.random()*9000, callback:shoot, callbackScope:this });
        };
        this.time.delayedCall(1500+Math.random()*3000, shoot);
    }

    // ── título ─────────────────────────────────────────────────────────────
    _buildTitle(W, H) {
        const cx = W/2;
        const pw = Math.min(W*.85, 800), ph = Math.min(H*.195, 106);
        const px = cx-pw/2, py = Math.round(H*.038);

        const g = this.add.graphics();
        // Fondo con brillo en el borde
        g.fillStyle(0x000618, 0.94); g.fillRect(px,py,pw,ph);
        // Borde principal
        g.lineStyle(1.5, 0x00ccff, 0.9); g.strokeRect(px,py,pw,ph);
        // Borde exterior sutil
        g.lineStyle(1, 0x4400aa, 0.3); g.strokeRect(px-2,py-2,pw+4,ph+4);
        // Esquinas
        g.lineStyle(2.5, 0x00ffff, 1);
        [[px,py,14,0,0,14],[px+pw,py,-14,0,0,14],[px,py+ph,14,0,0,-14],[px+pw,py+ph,-14,0,0,-14]]
            .forEach(([cx2,cy2,a,b,c,d]) => { g.beginPath(); g.moveTo(cx2+a,cy2+b); g.lineTo(cx2,cy2); g.lineTo(cx2+c,cy2+d); g.strokePath(); });
        // Líneas horizontales internas
        this._hLine(g, px+22, px+pw-22, py+15, 0x00ccff, 0.22);
        this._hLine(g, px+22, px+pw-22, py+ph-15, 0x00ccff, 0.22);
        // Barras laterales
        g.fillStyle(0x00ffff, 0.85);
        g.fillRect(px+9, py+ph*.28, 3, ph*.44);
        g.fillRect(px+pw-12, py+ph*.28, 3, ph*.44);
        // Puntos decorativos en esquinas del borde interior
        [px+20,px+pw-20].forEach(bx => {
            g.fillStyle(0x00ccff, 0.7); g.fillCircle(bx, py+16, 2.5);
            g.fillStyle(0x00ccff, 0.7); g.fillCircle(bx, py+ph-16, 2.5);
        });

        // Línea de escaneo animada
        const scan = this.add.graphics();
        let sy2 = py;
        this.time.addEvent({ delay:16, loop:true, callback:()=>{
            scan.clear();
            scan.lineStyle(1, 0x00ccff, 0.10); scan.beginPath();
            scan.moveTo(px+3,sy2); scan.lineTo(px+pw-3,sy2); scan.strokePath();
            sy2 += 0.9; if (sy2 > py+ph) sy2 = py;
        }});

        // Título
        const fsTitle = this._fs(H, .062, 40);
        const t = this.add.text(cx, py+ph*.43, "EL ÚLTIMO TRIPULANTE", {
            fontSize:`${fsTitle}px`, color:"#00ffff", fontFamily:"monospace", fontStyle:"bold",
            stroke:"#001122", strokeThickness:6,
        }).setOrigin(.5);
        this.tweens.add({ targets:t, alpha:{from:.80,to:1}, scaleX:{from:.995,to:1}, duration:2600, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });

        // Subtítulo
        this.add.text(cx, py+ph*.83,
            "▸  PROTOCOLO SUPERVIVENCIA — MÓDULO DE EMERGENCIA v3.7  ◂", {
            fontSize:`${this._fs(H,.018,12)}px`, color:"#004466", fontFamily:"monospace",
        }).setOrigin(.5);
    }

    // ── historia ───────────────────────────────────────────────────────────
    _buildStory(W, H) {
        const cx = W/2;
        const sw = Math.min(W*.78, 700), sh = Math.min(H*.155, 78);
        const sy = Math.round(H*.265);

        const g = this.add.graphics();
        g.fillStyle(0x000714, 0.82); g.fillRect(cx-sw/2, sy, sw, sh);
        g.lineStyle(1, 0x001d33, 0.9); g.strokeRect(cx-sw/2, sy, sw, sh);
        this._hLine(g, cx-sw/2+16, cx+sw/2-16, sy+13, 0x00ccff, 0.14);
        this._hLine(g, cx-sw/2+16, cx+sw/2-16, sy+sh-13, 0x00ccff, 0.14);
        // Dot en esquinas del story
        g.fillStyle(0x006688, 0.6);
        [[cx-sw/2+8,sy+8],[cx+sw/2-8,sy+8],[cx-sw/2+8,sy+sh-8],[cx+sw/2-8,sy+sh-8]]
            .forEach(([bx,by]) => g.fillCircle(bx,by,2));

        this.add.text(cx, sy+sh/2,
            "La nave fue atacada durante una misión en el espacio profundo.\n" +
            "Eres el único sobreviviente. Repara los sistemas dañados,\n" +
            "evita nuevas amenazas y encuentra una ruta segura para escapar.", {
            fontSize:`${this._fs(H,.024,14)}px`,
            color:"#6688aa", fontFamily:"monospace", align:"center", lineSpacing:5,
            wordWrap:{ width:sw-28 },
        }).setOrigin(.5);
    }

    // ── menú ───────────────────────────────────────────────────────────────
    _buildMenu(W, H) {
        const cx = W/2;
        const menuW = Math.min(W*.60, 500);
        const itemH = Math.min(Math.round(H*.090), 50);
        const gap   = Math.min(Math.round(H*.013), 7);
        const fsItem = this._fs(H, .031, 18);

        const DEFS = [
            { icon:"▶", label:this._isMob?"TOCA PARA INICIAR":"PRESIONA ENTER PARA INICIAR", action:"start",  col:0x00ffff, bright:true },
            { icon:"◈", label:"RÉCORDS",           action:"record", col:0xcc66ff },
            { icon:"◉", label:"MANUAL DEL JUEGO",  action:"manual", col:0x44ddff },
            { icon:"✕", label:"SALIR",             action:"exit",   col:0xff4466 },
        ];

        const totalH = DEFS.length*(itemH+gap) - gap;
        const my = Math.round(H*.450);

        // Panel contenedor con borde sutil
        const pad = 14;
        const panGfx = this.add.graphics();
        panGfx.fillStyle(0x000510, 0.60);
        panGfx.fillRect(cx-menuW/2-pad, my-pad, menuW+pad*2, totalH+pad*2);
        panGfx.lineStyle(1, 0x001a33, 0.7);
        panGfx.strokeRect(cx-menuW/2-pad, my-pad, menuW+pad*2, totalH+pad*2);

        this._selGfx = this.add.graphics();

        this._items = DEFS.map((def, i) => {
            const iy = my + i*(itemH+gap) + itemH/2;
            const halfH = itemH/2;

            // Fondo individual del botón
            const bg = this.add.graphics();
            bg.fillStyle(0x000d20, 0.78);
            bg.fillRect(cx-menuW/2, iy-halfH, menuW, itemH);
            bg.lineStyle(1, 0x001533, 0.55);
            bg.strokeRect(cx-menuW/2, iy-halfH, menuW, itemH);

            // Barra coloreada izquierda (siempre visible, dim)
            const bar = this.add.graphics();
            const numCol = Phaser.Display.Color.IntegerToColor(def.col);
            bar.fillStyle(def.col, 0.25);
            bar.fillRect(cx-menuW/2, iy-halfH, 4, itemH);

            // Icono
            const icon = this.add.text(cx-menuW/2+18, iy, def.icon, {
                fontSize:`${fsItem+2}px`, color:"#1a3d55", fontFamily:"monospace",
            }).setOrigin(0,.5);

            // Etiqueta
            const lbl = this.add.text(cx-menuW/2+50, iy, def.label, {
                fontSize:`${fsItem}px`, color:"#1a3d55", fontFamily:"monospace",
            }).setOrigin(0,.5);

            // Zona interactiva
            const zone = this.add.zone(cx, iy, menuW, itemH).setInteractive();
            zone.on("pointerover",  ()=>{ this._selIdx=i; this._redrawSel(); });
            zone.on("pointerdown",  ()=>{ this._selIdx=i; this._confirm(); });

            return { icon, lbl, bg, bar, action:def.action, col:def.col, iy, menuW, cx };
        });

        this._redrawSel();

        // Footer
        const hs = localStorage.getItem("highScore")||0;
        const nivelAlcanzado = localStorage.getItem("nivelAlcanzado") || 1;
        const progresoMaximo = localStorage.getItem("progresoMaximo") || 0;
        const footY = my + totalH + pad + 14;
        this.add.text(cx, footY, this._isMob ? "Toca una opción para seleccionar" : "↑ ↓  Navegar     ENTER  Confirmar", {
            fontSize:`${this._fs(H,.019,11)}px`, color:"#112233", fontFamily:"monospace",
        }).setOrigin(.5);
        const rec = this.add.text(cx,footY + this._fs(H,.038,22),
            `🏆  Récord: ${hs} pts    |    🚀 Nivel alcanzado: ${nivelAlcanzado}`,
            {  
                fontSize:`${this._fs(H,.022,13)}px`,color:"#4d3500", fontFamily:"monospace", fontStyle:"bold",}).
                setOrigin(.5);
        this.tweens.add({ targets:rec, alpha:{from:.6,to:1}, duration:1800, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    }

    _redrawSel() {
        if (!this._selGfx || !this._items.length) return;
        this._selGfx.clear();

        this._items.forEach((item, i) => {
            const sel = i === this._selIdx;
            const dimCol  = "#1a4466";
            const selHex  = "#" + item.col.toString(16).padStart(6,"0");

            // Color del ítem
            item.icon.setColor(sel ? selHex : dimCol);
            item.lbl.setColor(sel ? selHex : dimCol);
            item.lbl.setFontStyle(sel ? "bold" : "normal");

            // Barra izquierda
            item.bar.clear();
            item.bar.fillStyle(item.col, sel ? 0.85 : 0.20);
            item.bar.fillRect(item.cx - item.menuW/2, item.iy - 25, 4, 50);

            if (sel) {
                const { cx, menuW, iy, col } = item;
                // Relleno brillante
                this._selGfx.fillStyle(col, 0.10);
                this._selGfx.fillRect(cx-menuW/2, iy-25, menuW, 50);
                // Borde brillante
                this._selGfx.lineStyle(1.5, col, 0.90);
                this._selGfx.strokeRect(cx-menuW/2, iy-25, menuW, 50);
                // Triángulo indicador a la izquierda del panel
                const tx = cx-menuW/2-15;
                this._selGfx.fillStyle(col, 1);
                this._selGfx.fillTriangle(tx,iy, tx+9,iy-5, tx+9,iy+5);
                // Brillo derecho sutil
                this._selGfx.fillStyle(col, 0.06);
                this._selGfx.fillRect(cx+menuW/2-30, iy-25, 30, 50);
            }
        });
    }

    _confirm() {
        if (this._state!=="menu") return;
        const item = this._items[this._selIdx];
        if (!item) return;
        this.tweens.add({ targets:[item.lbl,item.icon], alpha:{from:.2,to:1}, duration:90, yoyo:true });
        switch(item.action) {
            case "start":  this._startGame();          break;
            case "record": this._openPanel("record");  break;
            case "manual": this._openPanel("manual");  break;
            case "exit":   this._doExit();             break;
        }
    }

    _startGame() {
        if (this._isMob && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
                .then(()=> screen.orientation?.lock?.("landscape").catch(()=>{}))
                .catch(()=>{});
        }
        this.cameras.main.fadeOut(450,0,0,0);
        this.cameras.main.once("camerafadeoutcomplete", ()=> this.scene.start("GameScene"));
    }

    _doExit() {
        this.cameras.main.fadeOut(600,0,0,0);
        this.time.delayedCall(650, ()=> {
            window.close();
            this.cameras.main.fadeIn(400,0,0,0);
            const W=this._W, H=this._H;
            const g=this.add.graphics().setDepth(500);
            g.fillStyle(0x000000,.96); g.fillRect(0,0,W,H);
            this.add.text(W/2,H/2-18,"¡Gracias por jugar!",{
                fontSize:"28px",color:"#00ffff",fontFamily:"monospace",fontStyle:"bold"
            }).setOrigin(.5).setDepth(501);
            this.add.text(W/2,H/2+20,"Cierra la pestaña para salir",{
                fontSize:"15px",color:"#223344",fontFamily:"monospace"
            }).setOrigin(.5).setDepth(501);
        });
    }

    // ── panel récords ──────────────────────────────────────────────────────
    _buildPanelRecord(W, H) {
        const cx=W/2, cy=H/2;
        const pw=Math.min(W*.62,440), ph=Math.min(H*.55,265);
        const px=cx-pw/2, py=cy-ph/2;
        const hs=Number(localStorage.getItem("highScore")||0);

        const c=this.add.container(0,0).setDepth(300).setVisible(false);
        const bd=this.add.rectangle(cx,cy,W,H,0x000000,.84).setInteractive();
        bd.on("pointerdown",()=>this._closePanel()); c.add(bd);

        const g=this.add.graphics();
        this._frame(g,px,py,pw,ph, 0x00ccff, 0x000b1a);
        this._hLine(g,px+18,px+pw-18,py+46,0x00ccff,.28);
        this._hLine(g,px+18,px+pw-18,py+ph-36,0x00ccff,.18);
        c.add(g);

        c.add(this.add.text(cx,py+24,"◈  RÉCORDS",{fontSize:`${this._fs(H,.042,26)}px`,color:"#00ccff",fontFamily:"monospace",fontStyle:"bold"}).setOrigin(.5));
        c.add(this.add.text(cx,py+ph*.36,"MEJOR PUNTAJE",{fontSize:`${this._fs(H,.022,13)}px`,color:"#1a3344",fontFamily:"monospace"}).setOrigin(.5));

        const sc=this.add.text(cx,py+ph*.56,hs>0?`${hs}`:"---",{
            fontSize:`${this._fs(H,.10,55)}px`,
            color:hs>0?"#e8a800":"#112233",fontFamily:"monospace",fontStyle:"bold"
        }).setOrigin(.5); c.add(sc);
        if(hs>0) this.tweens.add({targets:sc,scale:{from:1,to:1.06},duration:1100,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

        c.add(this.add.text(cx,py+ph*.73,hs>0?"puntos":"Sin récord todavía",{fontSize:`${this._fs(H,.020,12)}px`,color:"#112233",fontFamily:"monospace"}).setOrigin(.5));

        const cl=this.add.text(cx,py+ph-18,"[ ESC  /  TOCA PARA CERRAR ]",{fontSize:`${this._fs(H,.018,11)}px`,color:"#1a3344",fontFamily:"monospace"})
            .setOrigin(.5).setInteractive();
        cl.on("pointerdown",()=>this._closePanel());
        cl.on("pointerover",()=>cl.setColor("#00aacc")); cl.on("pointerout",()=>cl.setColor("#1a3344"));
        c.add(cl);
        this._panels.record=c;
    }

    // ── panel manual ───────────────────────────────────────────────────────
    _buildPanelManual(W, H) {
        const cx=W/2, cy=H/2;
        const pw=Math.min(W*.90,810), ph=Math.min(H*.90,495);
        const px=cx-pw/2, py=cy-ph/2;
        const fs=this._fs(H,.022,13), fsh=this._fs(H,.026,15), lh=this._fs(H,.042,24);

        const c=this.add.container(0,0).setDepth(300).setVisible(false);
        const bd=this.add.rectangle(cx,cy,W,H,0x000000,.86).setInteractive();
        c.add(bd);

        const g=this.add.graphics();
        this._frame(g,px,py,pw,ph);
        g.fillStyle(0x000d22,.96); g.fillRect(px+2,py+2,pw-4,42);
        this._hLine(g,px+16,px+pw-16,py+44,0x00ccff,.32);
        c.add(g);

        c.add(this.add.text(cx,py+22,"◉  MANUAL DEL JUEGO",{fontSize:`${this._fs(H,.038,22)}px`,color:"#00ccff",fontFamily:"monospace",fontStyle:"bold"}).setOrigin(.5));

        const col1=px+26, col2=cx+18, sY=py+58;
        const secs=[
            { x:col1, y:sY, title:"⬡ MOVIMIENTO", col:"#00ddaa", rows:[
                ["W / ↑","Mover hacia arriba"],["S / ↓","Mover hacia abajo"],
                ["A / ←","Mover a la izquierda"],["D / →","Mover a la derecha"],
                ["Joystick","Control táctil (móvil)"],
            ]},
            { x:col2, y:sY, title:"⬡ ACCIONES", col:"#44aaff", rows:[
                ["E","Reparar consola cercana"],["F","Usar botiquín"],
                ["M","Silenciar audio"],["ESC","Pausar / Reanudar"],
                ["R","Reiniciar partida"],
            ]},
            { x:col1, y:sY+lh*7.5, title:"⬡ OBJETIVO", col:"#ffaa00", rows:[
                ["1.","Recoge fusibles del mapa (máx. 2)"],
                ["2.","Repara las 3 consolas principales"],
                ["3.","Repara las 4 consolas globales"],
                ["4.","¡Escapa de la nave!"],
            ]},
            { x:col2, y:sY+lh*7.5, title:"⬡ CONSEJOS", col:"#ff6699", rows:[
                ["★","Lleva siempre fusibles contigo"],
                ["★","Mantén distancia de los robots"],
                ["★","Usa el botiquín antes de morir"],
                ["★","Explora el mapa con calma"],
            ]},
        ];

        secs.forEach(({ x, y, title, col, rows })=>{
            c.add(this.add.text(x,y,title,{fontSize:`${fsh}px`,color:col,fontFamily:"monospace",fontStyle:"bold"}));
            const g2=this.add.graphics();
            const nc=Phaser.Display.Color.HexStringToColor(col.replace("#","")).color;
            g2.lineStyle(1,nc,.25); g2.beginPath(); g2.moveTo(x,y+fsh+5); g2.lineTo(x+pw/2-32,y+fsh+5); g2.strokePath();
            c.add(g2);
            rows.forEach(([k,d],ri)=>{
                const ry=y+fsh+16+ri*lh*.90;
                c.add(this.add.text(x+4,ry,k,{fontSize:`${fs}px`,color:col,fontFamily:"monospace",fontStyle:"bold"}));
                c.add(this.add.text(x+76,ry,d,{fontSize:`${fs}px`,color:"#445566",fontFamily:"monospace"}));
            });
        });

        const cl=this.add.text(cx,py+ph-18,"[ ESC  /  TOCA PARA CERRAR ]",{fontSize:`${this._fs(H,.018,11)}px`,color:"#1a3344",fontFamily:"monospace"})
            .setOrigin(.5).setInteractive();
        cl.on("pointerdown",()=>this._closePanel());
        cl.on("pointerover",()=>cl.setColor("#00aacc")); cl.on("pointerout",()=>cl.setColor("#1a3344"));
        c.add(cl);
        this._panels.manual=c;
    }

    // ── paneles: abrir / cerrar ────────────────────────────────────────────
    _openPanel(name) {
        this._state=name;
        const p=this._panels[name]; if(!p) return;
        p.setVisible(true).setAlpha(0);
        this.tweens.add({targets:p,alpha:1,duration:200,ease:"Quad.easeOut"});
    }

    _closePanel() {
        const p=this._panels[this._state]; this._state="menu"; if(!p) return;
        this.tweens.add({targets:p,alpha:0,duration:170,ease:"Quad.easeIn",onComplete:()=>p.setVisible(false)});
    }

    // ── input ──────────────────────────────────────────────────────────────
    _setupInput() {
        this.input.keyboard.on("keydown-UP",()=>{ if(this._state!=="menu") return; this._selIdx=(this._selIdx-1+this._items.length)%this._items.length; this._redrawSel(); });
        this.input.keyboard.on("keydown-DOWN",()=>{ if(this._state!=="menu") return; this._selIdx=(this._selIdx+1)%this._items.length; this._redrawSel(); });
        this.input.keyboard.on("keydown-ENTER",()=>{ if(this._state==="menu") this._confirm(); });
        this.input.keyboard.on("keydown-ESC",()=>{ if(this._state!=="menu") this._closePanel(); });
    }
}
