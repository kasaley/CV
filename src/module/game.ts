import { Element as ElementWasm } from "../wasm_src/pkg/water_simulation";

const canvas = document.getElementById('arc-game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const PI2 = Math.PI * 2;
const maxHoldDuration = 2000; // 2 секунды
const lerpFactor = 0.1;
const mouseHoldSpeedMultiplier = 0.8;

// Параметры конфигурации
interface Config {
    gravity: number;
    damping: number;
    bounce: number;
    maxSpeed: number;
    scale: number;
    radius: number;
    padding: number;
    threshold: number;
    maxGoldCircles: number;
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
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
}

const element: Element = { x: canvasWidth / 2, y: canvasHeight - config.padding - config.radius, radius: config.radius, vx: 0, vy: 0 };

interface GoldCircle {
    x: number;
    y: number;
    radius: number;
}

let goldCircles: GoldCircle[] = [];
let score = 0;
let isMouseOverElement = false;
let mouseX = 0;
let mouseY = 0;
let currentAngle = 0;
let arrowColor = 'blue';
let isMouseDown = false;
let mouseDownStartTime = 0;
let mouseHoldDuration = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;
const speedThreshold = 15; // Порог скорости для отбивания шарика


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

    // Рисуем стрелку, если мышь над элементом
    drawArrow();


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

function drawArrow(): void {
    const { angle } = calculateDistanceAndAngle(mouseX, mouseY);
    currentAngle = lerp(currentAngle, angle + Math.PI, lerpFactor); // Указание в противоположную сторону
    const arrowLength = 10;
    const arrowX = element.x + Math.cos(currentAngle) * (element.radius + 20);
    const arrowY = element.y + Math.sin(currentAngle) * (element.radius + 20);

    if (isMouseDown) {
        mouseHoldDuration = Math.min(Date.now() - mouseDownStartTime, maxHoldDuration);
    } else {
        mouseHoldDuration = 0;
    }
    arrowColor = interpolateColor([0, 0, 255], [255, 0, 0], Math.min(mouseHoldDuration / maxHoldDuration, 1));

    ctx.beginPath();
    ctx.moveTo(element.x, element.y);
    ctx.lineTo(arrowX, arrowY);
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    const arrowTipX = element.x + Math.cos(currentAngle) * (element.radius + 20 + arrowLength);
    const arrowTipY = element.y + Math.sin(currentAngle) * (element.radius + 20 + arrowLength);

    ctx.beginPath();
    ctx.moveTo(arrowTipX, arrowTipY);
    ctx.lineTo(arrowX - arrowLength * Math.cos(currentAngle - Math.PI / 8), arrowY - arrowLength * Math.sin(currentAngle - Math.PI / 8));
    ctx.lineTo(arrowX - arrowLength * Math.cos(currentAngle + Math.PI / 8), arrowY - arrowLength * Math.sin(currentAngle + Math.PI / 8));
    ctx.lineTo(arrowTipX, arrowTipY);
    ctx.fillStyle = arrowColor;
    ctx.fill();
    ctx.closePath();
}

function lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
}

function interpolateColor(color1: [number, number, number], color2: [number, number, number], factor: number): string {
    const r = Math.round(lerp(color1[0], color2[0], factor));
    const g = Math.round(lerp(color1[1], color2[1], factor));
    const b = Math.round(lerp(color1[2], color2[2], factor));
    return `rgb(${r}, ${g}, ${b})`;
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

        // Проверка на столкновение a золотыми кружками
        checkCollisionWithGoldCircles();

        drawElement();
    }
}

// Обновленная функция handleCollision
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

    // Проверка на столкновение с мышью при высокой скорости
    if (mouseSpeed > speedThreshold && isMouseOverElement) {
        const angle = Math.atan2(mouseY - element.y, mouseX - element.x);
        const force = 40; // Сила отталкивания от мыши
        element.vx = -Math.cos(angle) * force;
        element.vy = -Math.sin(angle) * force;
    }
}

function calculateDistanceAndAngle(clickX: number, clickY: number) {
    const el = new ElementWasm(element.x, element.y)
    return el.calculate_distance_and_angle(clickX, clickY);
}

function calculateVelocity(clickX: number, clickY: number, holdDuration: number) {
    const { angle } = calculateDistanceAndAngle(clickX, clickY);
    const normalizedHoldDuration = Math.min(holdDuration, maxHoldDuration) / maxHoldDuration;
    const speed = (normalizedHoldDuration * mouseHoldSpeedMultiplier) * config.maxSpeed;
    element.vx = -(speed * Math.cos(angle)) * config.scale;
    element.vy = speed * Math.sin(angle) * config.scale;
}

function isClickInsideElement(clickX: number, clickY: number): boolean {
    const { distance } = calculateDistanceAndAngle(clickX, clickY);
    return distance <= element.radius;
}

// Обновленный обработчик события mousemove
canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const prevMouseX = mouseX;
    const prevMouseY = mouseY;

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    // Рассчитываем скорость мыши
    const deltaX = mouseX - prevMouseX;
    const deltaY = mouseY - prevMouseY;
    mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    isMouseOverElement = isClickInsideElement(mouseX, mouseY);

    if (isMouseOverElement) {
        if (isMouseDown) {
            mouseHoldDuration = Math.min(Date.now() - mouseDownStartTime, maxHoldDuration);
        } else {
            mouseHoldDuration = 0;
        }
        arrowColor = interpolateColor([0, 0, 255], [255, 0, 0], Math.min(mouseHoldDuration / maxHoldDuration, 1));
    }

    drawElement();
});

canvas.addEventListener('mousedown', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    if (isClickInsideElement(clickX, clickY)) {
        isMouseDown = true;
        mouseDownStartTime = Date.now();
    }
});

// Обновленный обработчик события mouseup
canvas.addEventListener('mouseup', (event: MouseEvent) => {
    if (isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        mouseHoldDuration = Math.min(Date.now() - mouseDownStartTime, maxHoldDuration);
        if (isClickInsideElement(clickX, clickY)) {
            calculateVelocity(clickX, clickY, mouseHoldDuration);
        }
        isMouseDown = false;
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
            const force = 2;
            element.vx = -Math.cos(angle) * force;
            element.vy = -Math.sin(angle) * force;

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

  if(mouseHoldDuration) {
    drawElement();
  }
  requestAnimationFrame(animate);
}

setInterval(generateRandomGoldCircle, 3000);

drawElement();
animate();
