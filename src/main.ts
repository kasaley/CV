import { initWaterModule } from './module/water';
import { drawBlocks } from './module/sort'
import { animate } from './module/game';

window.onload = async () => {
  const initAnimationWater = await initWaterModule();
  const array = Array.from(
      { length: 10 },
      () => Math.floor(Math.random() * 100) + 1,
  );
  initAnimationWater()
  drawBlocks(array, 768)
  animate()
}
