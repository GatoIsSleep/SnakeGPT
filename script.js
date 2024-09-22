const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 20;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
let direction = { x: 0, y: 0 };
let food = getRandomFoodPosition();
let score = 0;

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

function resetGame() {
    snake = [{ x: WIDTH / 2, y: HEIGHT / 2 }];
    direction = { x: 0, y: 0 };
    food = getRandomFoodPosition();
    score = 0;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntos: ${score}`, 10, 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawFood();
    drawSnake();
    drawScore();
    moveSnake();
    setTimeout(gameLoop, 100);
}

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