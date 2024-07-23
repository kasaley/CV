

export const initWaterModule = () => {
  return import('../pkg/water_simulation').then(wasm => {
      const canvas = document.getElementById('water') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if(!ctx || !canvas) {
        return () => { throw { message: 'Canvas not found' }};
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Задаем количество столбцов в сетке частиц
      const numCols = 100;

      // Задаем количество строк в сетке частиц
      const numRows = 100;

      // Вычисляем размер ячейки сетки, выбирая минимальный размер для корректного отображения на холсте
      const gridSize = Math.min(canvas.width / numCols, canvas.height / numRows);

      // Задаем коэффициент отступов между частицами
      const spacing = 2.5;

      // Задаем коэффициент упругости пружины
      const springConstant = 0.01;

      // Задаем коэффициент демпфирования
      const damping = 0.01;

      const particleSystem = new wasm.ParticleSystem(numCols, numRows, gridSize, spacing);

      function drawParticles(particles) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();

          for (let i = 0; i < particles.length; i += 6) {
              const x = particles[i];
              const y = particles[i + 1];
              const originalY = particles[i + 5];

              const heightDiff = y - originalY;
              const colorValue = 255 - Math.min(255, Math.abs(heightDiff) * 2);
              ctx.fillStyle = `rgb(${colorValue}, 0, ${255 - colorValue})`;
              ctx.shadowColor = ctx.fillStyle;
              ctx.beginPath();
              ctx.arc(x, y, gridSize / 2, 0, Math.PI * 2);
              ctx.fill();
          }

      }

      function animate() {
          particleSystem.update_particles(springConstant, damping);
          const particles = particleSystem.get_particles();
          drawParticles(particles);
          requestAnimationFrame(animate);
      }

      function handleMouseMove(event) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const mouseX = (event.clientX - rect.left) * scaleX;
          const mouseY = (event.clientY - rect.top) * scaleY;
          particleSystem.apply_effect(mouseX, mouseY);
      }

      canvas.addEventListener('mousemove', handleMouseMove);

      return animate;
  });
}
