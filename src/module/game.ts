import animationButtonStore from "../store/animationButtonStore";

const canvas = document.getElementById('arc-game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const PI2 = Math.PI * 2;

interface Element {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
}

const element: Element = { x: 400, y: 300, radius: 20, vx: 0, vy: 0 };

// Параметры конфигурации
interface Config {
    gravity: number;
    damping: number;
    bounce: number;
    maxSpeed: number;
    scale: number;
    threshold: number;
}

const config: Config = {
    gravity: 1,
    damping: 0.99,
    bounce: 0.98,
    maxSpeed: 20,
    scale: 20,
    threshold: 0.01, // Порог для определения состояния покоя
};

function drawElement(): void {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.arc(element.x, element.y, element.radius, 0, PI2);
    ctx.fillStyle = 'red';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.closePath();
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

        drawElement();
    }
}

function handleCollision(): void {
    if (element.x + element.radius > canvasWidth) {
        element.x = canvasWidth - element.radius;
        element.vx = -element.vx * config.bounce;
    } else if (element.x - element.radius < 0) {
        element.x = element.radius;
        element.vx = -element.vx * config.bounce;
    }

    if (element.y + element.radius > canvasHeight) {
        element.y = canvasHeight - element.radius;
        element.vy = -element.vy * config.bounce;
    } else if (element.y - element.radius < 0) {
        element.y = element.radius;
        element.vy = -element.vy * config.bounce;
    }
}

function calculateVelocity(clickX: number, clickY: number): void {
    const dx = clickX - element.x;
    const dy = clickY - element.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const speed = Math.min(distance / 10, config.maxSpeed);
    element.vx = -(speed * Math.cos(angle)) * config.scale;
    element.vy = speed * Math.sin(angle) * config.scale;
}

function isClickInsideElement(clickX: number, clickY: number): boolean {
    const dx = clickX - element.x;
    const dy = clickY - element.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
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

function animate(): void {
    updateElement();
    requestAnimationFrame(animate);
}

drawElement();
animate();
