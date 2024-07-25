import { Element as ElementWasm } from "../wasm_src/pkg/water_simulation";

const canvas = document.getElementById('arc-game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const PI2 = Math.PI * 2;

// Параметры конфигурации
interface Config {
    gravity: number; // Сила гравитации, влияющая на падение элемента
    damping: number; // Коэффициент затухания скорости при движении элемента
    bounce: number; // Коэффициент отскока при столкновении с границами canvas
    maxSpeed: number; // Максимальная скорость элемента
    scale: number; // Множитель ускорения элемента
    radius: number; // Радиус элемента
    padding: number; // Отступы по краям canvas
    threshold: number; // Порог для определения состояния покоя элемента
    maxGoldCircles: number; // Максимальное количество золотых кружков
}

const config: Config = {
    gravity: 1,
    damping: 0.99,
    bounce: 0.98,
    maxSpeed: 20,
    scale: 20,
    radius: 20,
    padding: 20,
    threshold: 0.01,
    maxGoldCircles: 5,
};

interface Element {
    x: number; // координаты элемента
    y: number; // координаты элемента
    radius: number; // радиус элемента
    vx: number; // скорость по горизонтали
    vy: number; // ускорение по вертикали
}

const element: Element = { x: canvasWidth / 2, y: canvasHeight - config.padding - config.radius, radius: config.radius, vx: 0, vy: 0 };

interface GoldCircle {
    x: number;
    y: number;
    radius: number;
}

let goldCircles: GoldCircle[] = [];
let score = 0;

function drawElement(): void {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем мячик
    ctx.beginPath();
    ctx.arc(element.x, element.y, element.radius, 0, PI2);
    ctx.fillStyle = 'red';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.closePath();
    // Рисуем золотые кружки
    goldCircles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, PI2);
        ctx.fillStyle = 'gold';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.closePath();
    });

    // Рисуем счетчик
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillStyle = 'gold'
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updateElement(): void {
    if (Math.abs(element.vx) > config.threshold || Math.abs(element.vy) > config.threshold) {
        element.vy += config.gravity;
        element.x += element.vx;
        element.y += element.vy;

        element.vx *= config.damping;
        element.vy *= config.damping;

        // Столкновение с границами canvas
        handleCollision();

        // Проверка на столкновение с золотыми кружками
        checkCollisionWithGoldCircles();

        drawElement();
    }
}

function handleCollision(): void {
    if (element.x + element.radius > canvasWidth - config.padding) {
        element.x = canvasWidth - element.radius - config.padding;
        element.vx = -element.vx * config.bounce;
    } else if (element.x - element.radius < config.padding) {
        element.x = element.radius + config.padding;
        element.vx = -element.vx * config.bounce;
    }

    if (element.y + element.radius > canvasHeight - config.padding) {
        element.y = canvasHeight - element.radius - config.padding;
        element.vy = -element.vy * config.bounce;
    } else if (element.y - element.radius < config.padding) {
        element.y = element.radius + config.padding;
        element.vy = -element.vy * config.bounce;
    }
}

// Вспомогательная функция для расчета расстояния и угла
function calculateDistanceAndAngle(clickX: number, clickY: number) {
  const el = new ElementWasm(element.x, element.y)
  return el.calculate_distance_and_angle(clickX, clickY);
}

function calculateVelocity(clickX: number, clickY: number) {
    const { distance, angle } = calculateDistanceAndAngle(clickX, clickY);
    const speed = Math.min(distance / 10, config.maxSpeed);
    element.vx = -(speed * Math.cos(angle)) * config.scale;
    element.vy = speed * Math.sin(angle) * config.scale;
}

function isClickInsideElement(clickX: number, clickY: number): boolean {
    const { distance } = calculateDistanceAndAngle(clickX, clickY);
    return distance <= element.radius;
}

canvas.addEventListener('mousedown', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    if (isClickInsideElement(clickX, clickY)) {
        calculateVelocity(clickX, clickY);
    }
});

function checkCollisionWithGoldCircles(): void {
    goldCircles.forEach((circle, index) => {
        const dx = element.x - circle.x;
        const dy = element.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < element.radius + circle.radius) {
            score++;

            // Отталкивание мяча
            const angle = Math.atan2(dy, dx);
            const force = 2; // Сила отталкивания
            element.vx = -Math.cos(angle) * force;
            element.vy = -Math.sin(angle) * force;

            // Удаление золотого кружка после столкновения
            goldCircles.splice(index, 1);
        }
    });
}

function generateRandomGoldCircle(): void {
    if (goldCircles.length < config.maxGoldCircles) {
        const radius = 5;
        const x = Math.random() * (canvasWidth - 2 * config.padding - 2 * radius) + config.padding + radius;
        const y = Math.random() * (canvasHeight - 2 * config.padding - 2 * radius) + config.padding + radius;
        goldCircles.push({ x, y, radius });
    }
}

function animate(): void {
    updateElement();
    requestAnimationFrame(animate);
}

setInterval(generateRandomGoldCircle, 3000); // Генерация новых кружков каждые 3 секунды

drawElement();
animate();
