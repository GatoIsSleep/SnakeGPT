// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD0VfWQv77iLYslpMpEcszZiz0XRzYJftg",
    authDomain: "snakegpt-53aae.firebaseapp.com",
    projectId: "snakegpt-53aae",
    storageBucket: "snakegpt-53aae.appspot.com",
    messagingSenderId: "472345581449",
    appId: "1:472345581449:web:31010fff5b649ffff8b358",
    measurementId: "G-BJVX6YY2EQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener elementos del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 20;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
let direction = { x: 0, y: 0 };
let food = getRandomFoodPosition();
let score = 0;

// Función para obtener una posición aleatoria de la comida
function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * (WIDTH / cellSize)) * cellSize,
        y: Math.floor(Math.random() * (HEIGHT / cellSize)) * cellSize
    };
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawSnake() {
    snake.forEach(segment => {
        drawRect(segment.x, segment.y, cellSize, cellSize, getRandomColor());
    });
}

function drawFood() {
    drawRect(food.x, food.y, cellSize, cellSize, 'red');
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

// Función para mover la serpiente
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = getRandomFoodPosition();
        score++;
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        resetGame();
    }
}

// Función para reiniciar el juego y pedir el nombre del jugador
function resetGame() {
    const playerName = askForName();
    saveScore(playerName, score); // Guardar la puntuación en Firebase
    snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
    direction = { x: 0, y: 0 };
    food = getRandomFoodPosition();
    score = 0;
}

// Función para dibujar la puntuación
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntos: ${score}`, 10, 20);
}

// Función para iniciar el bucle del juego
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawFood();
    drawSnake();
    drawScore();
    moveSnake();
    setTimeout(gameLoop, 100);
}

// Control de la dirección con el teclado
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -cellSize };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: cellSize };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -cellSize, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: cellSize, y: 0 };
            break;
    }
});

gameLoop();

// Función para solicitar el nombre del jugador
function askForName() {
    const name = prompt("Ingresa tu nombre:");
    return name ? name : "Jugador";
}

// Función para guardar la puntuación en Firestore
async function saveScore(name, score) {
    try {
        await addDoc(collection(db, "scores"), {
            name: name,
            score: score
        });
        console.log("Puntuación guardada");
    } catch (e) {
        console.error("Error al guardar la puntuación: ", e);
    }
}

// Función para cargar las puntuaciones desde Firestore
async function loadScores() {
    const scoresSnapshot = await getDocs(collection(db, "scores"));
    const scoresList = scoresSnapshot.docs.map(doc => doc.data());
    console.log("Puntuaciones cargadas: ", scoresList);
}

// Cargar puntuaciones al inicio del juego
loadScores();
