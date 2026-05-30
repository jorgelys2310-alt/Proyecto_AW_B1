const BASE_D  = 150;   // diámetro base joystick
const KNOB_D  = 58;    // diámetro knob joystick
const MAX_R   = (BASE_D - KNOB_D) / 2;
const BTN_D   = 66;    // diámetro botones acción
const PAD     = 18;    // margen desde bordes

const ACTION_CSS = [
    "position:fixed",
    `width:${BTN_D}px`,
    `height:${BTN_D}px`,
    "border-radius:50%",
    "background:rgba(4,16,12,0.80)",
    "border:2px solid rgba(0,210,255,0.60)",
    "color:#00d2ff",
    "font-size:21px",
    `line-height:${BTN_D}px`,
    "text-align:center",
    "font-family:monospace",
    "font-weight:bold",
    "letter-spacing:1px",
    "text-shadow:0 0 10px rgba(0,210,255,0.70)",
    "box-shadow:0 4px 14px rgba(0,0,0,0.65),0 0 10px rgba(0,210,255,0.14)",
    "touch-action:none",
    "user-select:none",
    "-webkit-user-select:none",
    "z-index:1000",
    "cursor:pointer",
    "padding:0",
].join(";");

const BTN_DEFS = [
    { id: "action", label: "E" },
    { id: "medkit", label: "F" },
];

export default class ResponsiveManager {
    constructor(scene) {
        this.scene   = scene;
        this.isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

        this.state        = { left:false, right:false, up:false, down:false, action:false, medkit:false };
        this._justPressed = {};
        this._btns        = {};
        this._joyBase     = null;
        this._joyKnob     = null;

        if (this.isTouch) {
            this._createJoystick();
            this._createActionButtons();
        }

        scene.scale.on("resize", this._reposition, this);
        scene.events.on("shutdown", this.destroy, this);
        scene.events.on("destroy",  this.destroy, this);
    }

    // ── Joystick ────────────────────────────────────────────────────────────
    _createJoystick() {
        const base = document.createElement("div");
        base.className = "rm-joy";
        Object.assign(base.style, {
            position:         "fixed",
            width:            `${BASE_D}px`,
            height:           `${BASE_D}px`,
            borderRadius:     "50%",
            background:       "rgba(0,220,170,0.07)",
            border:           "2px solid rgba(0,220,170,0.28)",
            zIndex:           "1000",
            touchAction:      "none",
            userSelect:       "none",
            WebkitUserSelect: "none",
        });

        const knob = document.createElement("div");
        knob.className = "rm-knob";
        Object.assign(knob.style, {
            position:      "fixed",
            width:         `${KNOB_D}px`,
            height:        `${KNOB_D}px`,
            borderRadius:  "50%",
            background:    "rgba(0,220,170,0.45)",
            border:        "2px solid rgba(0,220,170,0.90)",
            boxShadow:     "0 0 18px rgba(0,220,170,0.55)",
            zIndex:        "1001",
            touchAction:   "none",
            pointerEvents: "none",
        });

        document.body.appendChild(base);
        document.body.appendChild(knob);
        this._joyBase = base;
        this._joyKnob = knob;

        this._placeJoy(0, 0);

        const move = (e) => {
            e.preventDefault();
            const t    = e.touches[0];
            const rect = base.getBoundingClientRect();
            const bx   = rect.left + rect.width  / 2;
            const by   = rect.top  + rect.height / 2;
            let dx = t.clientX - bx;
            let dy = t.clientY - by;
            const d = Math.hypot(dx, dy);
            if (d > MAX_R) { dx *= MAX_R / d; dy *= MAX_R / d; }

            const thr = MAX_R * 0.28;
            this.state.left  = dx < -thr;
            this.state.right = dx >  thr;
            this.state.up    = dy < -thr;
            this.state.down  = dy >  thr;
            this._placeJoy(dx, dy);
        };

        const end = (e) => {
            e.preventDefault();
            this.state.left = this.state.right = this.state.up = this.state.down = false;
            this._placeJoy(0, 0);
        };

        base.addEventListener("touchstart",  move, { passive: false });
        base.addEventListener("touchmove",   move, { passive: false });
        base.addEventListener("touchend",    end,  { passive: false });
        base.addEventListener("touchcancel", end,  { passive: false });
    }

    _placeJoy(dx, dy) {
        if (!this._joyBase || !this._joyKnob) return;
        const rect = this._joyBase.getBoundingClientRect();
        if (!rect.width) {
            // aún sin layout — posición aproximada por defecto
            const by = window.innerHeight - PAD - BASE_D / 2;
            const bx = PAD + BASE_D / 2;
            this._joyKnob.style.left = `${bx + dx - KNOB_D / 2}px`;
            this._joyKnob.style.top  = `${by + dy - KNOB_D / 2}px`;
            return;
        }
        const bx = rect.left + rect.width  / 2;
        const by = rect.top  + rect.height / 2;
        this._joyKnob.style.left = `${bx + dx - KNOB_D / 2}px`;
        this._joyKnob.style.top  = `${by + dy - KNOB_D / 2}px`;
    }

    // ── Botones de acción ────────────────────────────────────────────────────
    _createActionButtons() {
        BTN_DEFS.forEach(({ id, label }) => {
            const el = document.createElement("button");
            el.textContent = label;
            el.className   = "rm-btn";
            el.style.cssText = ACTION_CSS;

            const press = (e) => {
                e.preventDefault();
                this.state[id]        = true;
                this._justPressed[id] = true;
                el.style.background   = "rgba(0,210,255,0.30)";
                el.style.boxShadow    = "0 2px 6px rgba(0,0,0,0.5),0 0 22px rgba(0,210,255,0.55)";
                el.style.transform    = "scale(0.91)";
            };
            const release = (e) => {
                e.preventDefault();
                this.state[id]      = false;
                el.style.background = "rgba(4,16,12,0.80)";
                el.style.boxShadow  = "0 4px 14px rgba(0,0,0,0.65),0 0 10px rgba(0,210,255,0.14)";
                el.style.transform  = "scale(1)";
            };

            el.addEventListener("touchstart",  press,   { passive: false });
            el.addEventListener("touchend",    release, { passive: false });
            el.addEventListener("touchcancel", release, { passive: false });
            el.addEventListener("mousedown",   press);
            el.addEventListener("mouseup",     release);
            el.addEventListener("mouseleave",  release);

            document.body.appendChild(el);
            this._btns[id] = el;
        });

        this._repositionButtons();
    }

    // ── Reposicionamiento ────────────────────────────────────────────────────
    _reposition() {
        if (!this.isTouch) return;
        this._repositionJoystick();
        this._repositionButtons();
    }

    _repositionJoystick() {
        if (!this._joyBase) return;
        const top  = window.innerHeight - PAD - BASE_D;
        const left = PAD;
        this._joyBase.style.top  = `${top}px`;
        this._joyBase.style.left = `${left}px`;
        this._placeJoy(0, 0);
    }

    _repositionButtons() {
        const E = this._btns.action;
        const F = this._btns.medkit;
        const bottom = PAD + BTN_D * 0.5;

        if (E) {
            E.style.right  = `${PAD + BTN_D + 12}px`;
            E.style.bottom = `${bottom}px`;
            E.style.left   = "auto";
            E.style.top    = "auto";
        }
        if (F) {
            F.style.right  = `${PAD}px`;
            F.style.bottom = `${bottom}px`;
            F.style.left   = "auto";
            F.style.top    = "auto";
        }
    }

    // ── API pública ──────────────────────────────────────────────────────────
    getInput(cursors = {}, keys = {}) {
        const t = this.state;
        return {
            left:  { isDown: !!(cursors?.left?.isDown  || keys?.left?.isDown  || t.left)  },
            right: { isDown: !!(cursors?.right?.isDown || keys?.right?.isDown || t.right) },
            up:    { isDown: !!(cursors?.up?.isDown    || keys?.up?.isDown    || t.up)    },
            down:  { isDown: !!(cursors?.down?.isDown  || keys?.down?.isDown  || t.down)  },
        };
    }

    justPressed(key) {
        const val = !!this._justPressed[key];
        this._justPressed[key] = false;
        return val;
    }

    destroy() {
        if (!this.scene) return;
        this.scene.scale.off("resize", this._reposition, this);
        this._joyBase?.remove();
        this._joyKnob?.remove();
        Object.values(this._btns).forEach(el => el?.remove());
        this._btns  = {};
        this.scene  = null;
    }
}
