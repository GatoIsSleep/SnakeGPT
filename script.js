// Importamos las funciones necesarias desde Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Configuración de Firebase (tus datos proporcionados)
const firebaseConfig = {
    apiKey: "AIzaSyD0VfWQv77iLYslpMpEcszZiz0XRzYJftg",
    authDomain: "snakegpt-53aae.firebaseapp.com",
    projectId: "snakegpt-53aae",
    storageBucket: "snakegpt-53aae.appspot.com",
    messagingSenderId: "472345581449",
    appId: "1:472345581449:web:31010fff5b649ffff8b358",
    measurementId: "G-BJVX6YY2EQ"
};

// Inicializamos la app de Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuración del canvas y variables del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
let direction = { x: 0, y: 0 };
let food = getRandomFoodPosition();
let score = 0;

// Función para obtener una posición aleatoria para la comida
function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * (WIDTH / cellSize)) * cellSize,
        y: Math.floor(Math.random() * (HEIGHT / cellSize)) * cellSize
    };
}

// Función para dibujar un rectángulo (serpiente y comida)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Función para dibujar la serpiente
function drawSnake() {
    snake.forEach(segment => {
        drawRect(segment.x, segment.y, cellSize, cellSize, 'lime');
    });
}

// Función para dibujar la comida
function drawFood() {
    drawRect(food.x, food.y, cellSize, cellSize, 'red');
}

// Función para mover la serpiente
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    // Si la serpiente come la comida
    if (head.x === food.x && head.y === food.y) {
        food = getRandomFoodPosition();
        score++;
    } else {
        snake.pop();
    }

    // Condiciones de colisión (paredes y cuerpo propio)
    if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        saveScore(prompt("¡Juego terminado! Ingresa tu nombre:"), score);
        resetGame();
    }
}

// Función para reiniciar el juego
function resetGame() {
    snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
    direction = { x: 0, y: 0 };
    food = getRandomFoodPosition();
    score = 0;
}

// Función para mostrar la puntuación
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntos: ${score}`, 10, 20);
}

// Bucle del juego
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawFood();
    drawSnake();
    drawScore();
    moveSnake();
    setTimeout(gameLoop, 100);
}

// Evento de teclado para controlar la dirección de la serpiente
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

// Función para cargar y mostrar las puntuaciones del leaderboard
async function loadScores() {
    const scoresSnapshot = await getDocs(collection(db, "scores"));
    const scoresList = scoresSnapshot.docs.map(doc => doc.data());
    scoresList.sort((a, b) => b.score - a.score); // Ordenar por puntuación descendente
    console.log("Leaderboard:", scoresList);
}

// Inicia el bucle del juego
gameLoop();
