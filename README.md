# Último Tripulante

**Último Tripulante** es un videojuego 2D desarrollado con **Phaser.js** y **JavaScript**, perteneciente al arquetipo **Top-Down Adventure / Survivors-like**.
El jugador controla al último sobreviviente de una nave espacial dañada, debe recolectar fusibles, reparar consolas y evitar robots enemigos para poder escapar.

---

## Descripción del juego

La nave fue atacada y sus sistemas principales quedaron desactivados. El jugador debe explorar el escenario, recoger fusibles y reparar las consolas distribuidas por la nave. Mientras tanto, robots enemigos patrullan y persiguen al jugador, causando daño si logran alcanzarlo.

El objetivo principal es sobrevivir el tiempo suficiente para reparar los sistemas de la nave y completar la misión.

---

## Objetivo del jugador

El jugador debe:

* Explorar la nave.
* Recolectar fusibles.
* Reparar las consolas dañadas.
* Evitar a los robots enemigos.
* Mantener su vida por encima de cero.
* Completar la reparación total de la nave para ganar.

---

## Mecánicas principales

* Movimiento libre en vista superior.
* Colisiones con paredes y objetos del mapa.
* Enemigos con comportamiento de persecución.
* Sistema de vida del jugador.
* Recolección de fusibles.
* Reparación de consolas.
* Pantalla de victoria.
* Pantalla de derrota.
* Menú principal.
* Sistema de pausa.
* Reinicio del juego.

---

## Controles

### Teclado

| Tecla          | Acción                      |
| -------------- | --------------------------- |
| Flechas / WASD | Mover al jugador            |
| E              | Reparar consola             |
| F              | Usar botiquín               |
| ESC            | Pausar o reanudar el juego  |
| R              | Reiniciar partida           |
| Enter          | Iniciar juego desde el menú |

---

## Tecnologías utilizadas

* Phaser.js
* JavaScript
* Vite
* HTML5
* CSS3

---

## Instalación y ejecución

Para ejecutar el proyecto localmente, se deben seguir los siguientes pasos:

### 1. Clonar o descargar el proyecto

```bash
git clone https://github.com/jorgelys2310-alt/Proyecto_AW_B1.git
```

O descargar el archivo ZIP y descomprimirlo.

### 2. Entrar a la carpeta del proyecto

```bash
cd ProyectoB1
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

### 5. Abrir en el navegador

Después de ejecutar el comando anterior, Vite mostrará una dirección similar a:

```bash
http://localhost:5173
```

Abrir esa dirección en el navegador para jugar.

---

## Estructura del proyecto

```txt
ProyectoB1/
│
├── public/
│   └── assets/
│       ├── enemies/
│       ├── items/
│       ├── map/
│       ├── player/
│       └── ui/
│
├── src/
│   ├── objects/
│   │   ├── Enemy.js
│   │   └── Player.js
│   │
│   ├── scenes/
│   │   ├── GameScene.js
│   │   └── MenuScene.js
│   │
│   ├── audio/
│   ├── managers/
│   ├── physics/
│   ├── ui/
│   ├── main.js
│   └── style.css
│
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

---

## Descripción de archivos principales

### `src/main.js`

Archivo principal del proyecto.
Configura Phaser, define el tamaño del juego, el tipo de físicas, el escalado de pantalla y registra las escenas principales.

### `src/scenes/MenuScene.js`

Escena del menú principal.
Muestra el título del juego, una imagen de fondo, instrucciones iniciales y permite iniciar la partida.

### `src/scenes/GameScene.js`

Escena principal del juego.
Contiene la lógica del mapa, jugador, enemigos, colisiones, HUD, pausa, victoria, derrota y reinicio.

### `src/objects/Player.js`

Clase encargada del jugador.
Controla el movimiento, velocidad, animación y comportamiento básico del personaje.

### `src/objects/Enemy.js`

Clase encargada de los robots enemigos.
Define su movimiento y comportamiento de persecución hacia el jugador.

---

## Assets utilizados

El proyecto utiliza recursos visuales para:

* Personaje principal.
* Robots enemigos.
* Mapa de la nave.
* Tileset de ciencia ficción.
* Fusibles.
* Fondo del menú.

Los assets fueron organizados dentro de la carpeta `public/assets`.

---

## Condición de victoria

El jugador gana cuando logra reparar todas las consolas necesarias de la nave.
Al cumplirse esta condición, se muestra una pantalla de victoria indicando que la misión fue completada.

---

## Condición de derrota

El jugador pierde cuando su vida llega a cero debido al daño recibido por los robots enemigos.
Cuando esto ocurre, se muestra una pantalla de Game Over y se permite reiniciar la partida.

---

## Autor

Proyecto desarrollado por:

**Jorge Yánez** 

Asignatura: **Aplicaciones Web**
Proyecto Final de Primer Bimestre
Escuela Politécnica Nacional

---

## Créditos

* Motor de juego: Phaser.js
* Entorno de desarrollo: Vite
* Editor recomendado: Visual Studio Code
* Assets gratuitos: Kenney Assets y recursos libres utilizados con fines académicos

---

## Estado del proyecto

El proyecto se encuentra en una versión funcional inicial.
Permite jugar una partida completa desde el menú hasta la victoria o derrota, aunque todavía puede mejorar con audio, persistencia, puntaje y controles móviles.
