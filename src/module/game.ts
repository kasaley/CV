// Получаем элемент canvas и его контекст
const canvas = document.getElementById('arc-game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Константы для физики
const gravity = 0.5; // Гравитация
const airResistance = 0.99; // Сопротивление воздуха
const initialBallRadius = 20; // Начальный радиус мяча
const minBallRadius = 5; // Минимальный радиус мяча
const ballColor = 'red'; // Цвет мяча
const elasticityFactor = 0.8; // Коэффициент упругости

// Объект мяча
let ball = {
  x: canvas.width / 2, // Начальная позиция по оси X
  y: canvas.height / 2, // Начальная позиция по оси Y
  vx: 0, // Скорость по оси X
  vy: 0, // Скорость по оси Y
  radius: initialBallRadius, // Радиус мяча
  isDragging: false, // Флаг для перетаскивания
  isMouseDown: false, // Флаг для нажатия мыши
  lastMouseX: 0, // Последняя позиция мыши по X
  lastMouseY: 0, // Последняя позиция мыши по Y
  lastMouseTime: 0 // Последнее время движения мыши
};

// Функция для рисования мяча
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

// Функция для обновления физики мяча
function updatePhysics() {
  if (!ball.isDragging) {
    ball.vy += gravity; // Применение гравитации
    ball.vx *= airResistance; // Применение сопротивления воздуха
    ball.vy *= airResistance;

    ball.x += ball.vx; // Обновление позиции по X
    ball.y += ball.vy; // Обновление позиции по Y

    // Проверка столкновения с полом и потолком
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy = -ball.vy * elasticityFactor;
      ball.radius = Math.max(minBallRadius, initialBallRadius * (1 - Math.abs(ball.vy) / 20));
    } else if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy * elasticityFactor;
      ball.radius = Math.max(minBallRadius, initialBallRadius * (1 - Math.abs(ball.vy) / 20));
    }

    // Проверка столкновения со стенами
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx = -ball.vx * elasticityFactor;
      ball.radius = Math.max(minBallRadius, initialBallRadius * (1 - Math.abs(ball.vx) / 20));
    } else if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx * elasticityFactor;
      ball.radius = Math.max(minBallRadius, initialBallRadius * (1 - Math.abs(ball.vx) / 20));
    }

    // Постепенное восстановление радиуса мяча
    if (ball.radius < initialBallRadius) {
      ball.radius += (initialBallRadius - ball.radius) * 0.1;
    }
  }
}

// Функция для очистки canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Функция для анимации
export function animate() {
  clearCanvas();
  drawBall();
  updatePhysics();
  requestAnimationFrame(animate);
}

// Обработчик события нажатия мыши
canvas.addEventListener('mousedown', (e) => {
  const dx = e.clientX - ball.x;
  const dy = e.clientY - ball.y;
  if (dx * dx + dy * dy <= ball.radius * ball.radius) {
    ball.isDragging = true;
    ball.isMouseDown = true;
    ball.vx = 0;
    ball.vy = 0;
    ball.offsetX = dx;
    ball.offsetY = dy;
    ball.lastMouseX = e.clientX;
    ball.lastMouseY = e.clientY;
    ball.lastMouseTime = Date.now();
  }
});

// Обработчик события движения мыши
canvas.addEventListener('mousemove', (e) => {
  if (ball.isDragging && ball.isMouseDown) {
    const now = Date.now();
    const deltaTime = (now - ball.lastMouseTime) / 1000; // время в секундах
    if (deltaTime > 0) {
      ball.vx = (e.clientX - ball.lastMouseX) / deltaTime * 0.006;
      ball.vy = (e.clientY - ball.lastMouseY) / deltaTime  * 0.006;
      ball.lastMouseX = e.clientX;
      ball.lastMouseY = e.clientY;
      ball.lastMouseTime = now;
    }
    ball.x = e.clientX - ball.offsetX;
    ball.y = e.clientY - ball.offsetY;
  }
});

// Обработчик события отпускания мыши
canvas.addEventListener('mouseup', () => {
  ball.isMouseDown = false;
  ball.isDragging = false;
});
