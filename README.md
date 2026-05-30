# Último Tripulante

**Último Tripulante** es un videojuego 2D de acción y exploración top-down desarrollado con **Phaser.js** y **JavaScript**, construido para el Proyecto Final de Primer Bimestre de la asignatura **Aplicaciones Web**.

---

## Descripción del juego y arquetipo

**Arquetipo:** Top-Down Adventure / Survivors-like

La nave espacial fue atacada y sus sistemas quedaron inutilizados. El jugador controla al último tripulante sobreviviente: debe explorar la nave, recolectar fusibles dispersos por los pasillos y reparar las consolas dañadas para restaurar los sistemas de navegación. Robots enemigos patrullan el mapa y persiguen al jugador; si la vida llega a cero, la misión fracasa.

**Objetivo:** reparar las 3 consolas principales y luego las 4 consolas globales antes de quedarse sin vida.

---

## Instalación y ejecución con Vite

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgelys2310-alt/Proyecto_AW_B1.git

# 2. Entrar a la carpeta del proyecto
cd Proyecto_AW_B1

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Vite mostrará una URL similar a `http://localhost:5173` — ábrela en el navegador para jugar.

```bash
# Generar build de producción
npm run build

# Previsualizar el build
npm run preview
```

---

## Controles

### Teclado (escritorio)

| Tecla            | Acción                       |
| ---------------- | ---------------------------- |
| `W A S D`        | Mover al jugador             |
| Flechas `↑↓←→`  | Mover al jugador             |
| `E`              | Reparar consola cercana      |
| `F`              | Usar botiquín cercano        |
| `M`              | Silenciar / activar audio    |
| `ESC`            | Pausar o reanudar el juego   |
| `R`              | Reiniciar partida            |
| `Enter`          | Iniciar juego desde el menú  |

### Táctiles (móvil / tablet)

| Botón virtual | Acción                  |
| ------------- | ----------------------- |
| `◀ ▶ ▲ ▼`   | Mover al jugador        |
| `E`           | Reparar consola cercana |
| `F`           | Usar botiquín cercano   |

Los botones aparecen automáticamente cuando se detecta un dispositivo táctil y se reposicionan al rotar la pantalla.

---

## Estructura de carpetas

```
Proyecto_AW_B1/
│
├── public/
│   └── assets/
│       ├── audio/          # Música y efectos de sonido (.mp3, .wav)
│       ├── enemies/        # Spritesheet del robot enemigo
│       ├── items/          # Imagen del fusible
│       ├── map/            # Mapa Tiled (.json, .tmx) y tileset
│       ├── player/         # Spritesheet del jugador
│       └── ui/             # Fondo del menú
│
├── src/
│   ├── managers/
│   │   └── ResponsiveManager.js   # Detecta touch, botones virtuales, getInput()
│   │
│   ├── objects/
│   │   ├── Enemy.js               # Clase enemigo: patrulla + persecución
│   │   └── Player.js              # Clase jugador: movimiento 4 direcciones
│   │
│   ├── scenes/
│   │   ├── GameScene.js           # Escena principal: lógica completa del juego
│   │   └── MenuScene.js           # Menú principal con récord y controles
│   │
│   ├── audio/                     # (reservado para módulos de audio futuros)
│   ├── physics/                   # (reservado para helpers de físicas futuros)
│   ├── ui/                        # (reservado para componentes de UI futuros)
│   │
│   ├── main.js                    # Configuración de Phaser y arranque del juego
│   └── style.css                  # Estilos globales y contenedor del canvas
│
├── index.html
├── package.json
└── README.md
```

---

## Funcionalidades implementadas

### Mecánicas de juego
- Movimiento en 4 direcciones con velocidad diagonal normalizada
- Sistema de colisiones con paredes y puertas mediante capa de colisión Tiled
- Enemigos con IA: patrulla horizontal y persecución al detectar al jugador en rango
- Invulnerabilidad temporal tras recibir daño (parpadeo + knockback)
- Recolección de fusibles con límite de inventario (máx. 2)
- Reparación de consolas por fases (3 fusibles por consola)
- Sistema de oleadas: los fusibles se regeneran al completar cada consola
- Desbloqueo progresivo de puertas y zonas de fusibles al reparar consolas
- Condición de victoria: 3 consolas normales + 4 consolas globales reparadas
- Condición de derrota: vida del jugador llega a 0
- Botiquines con usos limitados (2 usos por botiquín)

### HUD y UI
- Contador de fusibles en inventario
- Indicador de vida con corazones (❤️)
- Puntaje en tiempo real
- Récord de sesión (mejor puntaje)
- Mensaje contextual de interacción (mostrar/ocultar según proximidad)
- Pantalla de Game Over con instrucción de reinicio
- Pantalla de Victoria con mensaje narrativo
- Menú de Pausa (ESC)
- Doble cámara: cámara del mundo (sigue al jugador, zoom 1.7×) + cámara del HUD (fija)

### Audio
- Música de fondo en bucle con volumen ajustado
- Efectos de sonido: recoger fusible, reparar, abrir puerta, daño, game over, victoria
- Toggle de mute con tecla `M`, estado persistido en `localStorage`

### Persistencia
- Récord (high score) guardado en `localStorage` — persiste entre sesiones
- Estado de mute guardado en `localStorage`
- El menú muestra el récord de la sesión anterior con animación pulsante

### Responsive y controles táctiles
- `Phaser.Scale.RESIZE`: el canvas se adapta al tamaño del viewport
- `ResponsiveManager`: detecta dispositivos táctiles y muestra D-pad + botones de acción
- Los botones virtuales se reposicionan automáticamente al girar la pantalla o cambiar el tamaño de ventana
- `getInput()` unifica teclado y touch en un único objeto de entrada
- `justPressed()` reproduce el comportamiento de `JustDown` para acciones puntuales táctiles
- El HUD y los paneles se recentran dinámicamente al hacer resize

---

## Tecnologías usadas

| Tecnología    | Versión   | Rol                                            |
| ------------- | --------- | ---------------------------------------------- |
| Phaser.js     | ^4.1.0    | Motor de juego: render, física arcade, cámaras |
| JavaScript    | ES2022+   | Lógica del juego, clases, módulos              |
| Vite          | ^8.0.12   | Bundler y servidor de desarrollo               |
| HTML5         | —         | Canvas y estructura del documento              |
| CSS3          | —         | Estilos del contenedor y responsive base       |
| Tiled         | —         | Editor del mapa (.tmx exportado a .json)       |

---

## Créditos de assets

| Asset                         | Fuente              | Licencia    |
| ----------------------------- | ------------------- | ----------- |
| Tileset SciFi (64×64)         | Kenney.nl           | CC0 1.0     |
| Spritesheet jugador           | OpenGameArt.org     | CC0 / libre |
| Spritesheet robot enemigo     | OpenGameArt.org     | CC0 / libre |
| Efectos de sonido             | Pixabay             | Libre       |
| Música de fondo               | Pixabay             | Libre       |
| Imagen fondo menú             | Recurso libre       | Libre       |

> Todos los assets son de uso libre para proyectos académicos y no comerciales.

---

## Autoevaluación — Rúbrica del proyecto

| Criterio de evaluación                           | Puntaje máx. | Autoevaluación | Evidencia / Justificación                                                              |
| ------------------------------------------------ | :----------: | :------------: | -------------------------------------------------------------------------------------- |
| Mecánicas de juego implementadas y funcionales   | —            | —              | Movimiento, enemigos, consolas, puertas, fusibles, botiquines, victoria y derrota      |
| Sistema de HUD completo                          | —            | —              | Vida, puntaje, récord, contador de fusibles, mensajes contextuales                     |
| Sistema de audio                                 | —            | —              | Música en bucle, 6 efectos SFX, toggle mute persistido                                 |
| Persistencia de datos (localStorage)             | —            | —              | Récord y estado de mute guardados entre sesiones                                       |
| Responsive design y controles táctiles           | —            | —              | `RESIZE` mode + `ResponsiveManager` con D-pad y botones de acción táctiles            |
| Calidad del código y arquitectura                | —            | —              | Clases separadas (Player, Enemy), managers, escenas, sin lógica duplicada              |
| README completo y documentación                  | —            | —              | Descripción, instalación, controles, estructura, funcionalidades, créditos, rúbrica    |
| **Total**                                        | —            | —              |                                                                                        |

---

## Autor

**Jorge Yánez**

**Analy Yepez**

Asignatura: **Aplicaciones Web**
Proyecto Final — Primer Bimestre
Escuela Politécnica Nacional
