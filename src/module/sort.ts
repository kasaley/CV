const canvas = document.getElementById("quick-sort") as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export function drawBlocks(array = [], containerWidth) {
  const blockWidth = 40;
  const blockHeight = 40;
  const padding = 5;
  const borderRadius = 6;
  const totalBlockWidth = blockWidth + padding;
  const totalWidth = array.length * totalBlockWidth - padding;

  // Вычисляем начальную координату X для выравнивания по центру
  const startX = (containerWidth - totalWidth) / 2;

  // Функция для рисования скругленного прямоугольника
  function drawRoundedRect(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawFrame(blocks, positions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < blocks.length; i++) {
      const { x, y } = positions[i];
      const randomNum = blocks[i];

      // Настройки тени
      ctx.shadowColor = '#a8a3a3';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Рисуем блок
      drawRoundedRect(x, y, blockWidth, blockHeight, borderRadius, 'white', 'black');

      // Сброс настроек тени, чтобы не повлиять на текст
      ctx.shadowColor = 'transparent';

      // Рисуем случайное число в центре блока
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      ctx.fillText(String(randomNum), x + blockWidth / 2, y + blockHeight / 2);
    }
  }

  function animateSwap(blocks) {
    const positions = blocks.map((_, i) => {
      const x = startX + i * totalBlockWidth;
      const y = 0;
      return { x, y };
    });

    const startPositionFirst = { ...positions[0] };
    const startPositionLast = { ...positions[blocks.length - 1] };

    const endPositionFirst = { x: startPositionLast.x, y: startPositionLast.y };
    const endPositionLast = { x: startPositionFirst.x, y: startPositionFirst.y };

    let startTime;
    const duration = 1000;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Use sine function for smooth easing
      const sinusoidalT = (Math.sin((t - 0.5) * Math.PI) + 1) / 2;

      // Update positions for animation
      positions[0].x = startPositionFirst.x + sinusoidalT * (endPositionFirst.x - startPositionFirst.x);
      positions[0].y = startPositionFirst.y + sinusoidalT * (endPositionFirst.y - startPositionFirst.y);

      positions[blocks.length - 1].x = startPositionLast.x + sinusoidalT * (endPositionLast.x - startPositionLast.x);
      positions[blocks.length - 1].y = startPositionLast.y + sinusoidalT * (endPositionLast.y - startPositionLast.y);

      // Draw the current frame
      drawFrame(blocks, positions);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        drawFrame(blocks, positions);
      }
    }

    requestAnimationFrame(animate);
  }

  // Начинаем анимацию
  animateSwap([...array]);
}
