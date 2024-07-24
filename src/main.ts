import { initWaterModule } from './module/water';
import { drawBlocks } from './module/sort'
import  './module/game';
import animationButtonStore from './store/animationButtonStore';

window.onload = async () => {
  const startWaterButton = document.getElementById('start-water');
  let isWaterAnimationStoped = true;
  const { animate, stop, start } = await initWaterModule();

  startWaterButton?.addEventListener('click', async () => {
    if (isWaterAnimationStoped) {
      isWaterAnimationStoped = false;
      startWaterButton.innerHTML = 'Stop';
      start();
      animate()
    } else {
      isWaterAnimationStoped = true;
      startWaterButton.innerHTML = 'Start';
      stop();
    }

  })

  // const array = Array.from(
  //     { length: 10 },
  //     () => Math.floor(Math.random() * 100) + 1,
  // );
  // drawBlocks(array, 768)
}
