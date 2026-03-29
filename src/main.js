import { createCubeHelper } from './cube-helper.js';
import { loadImage } from './image-loader.js';
import { createPointCloud, disposePointCloud } from './point-cloud.js';
import { createScene } from './scene.js';

const container = document.getElementById('canvas-container');
const fileInput = document.getElementById('file-input');
const progressEl = document.getElementById('progress');
const statsEl = document.getElementById('stats');
const statPixels = document.getElementById('stat-pixels');
const statColors = document.getElementById('stat-colors');
const statCompression = document.getElementById('stat-compression');
const statTime = document.getElementById('stat-time');

const { scene } = createScene(container);
scene.add(createCubeHelper());

const worker = new Worker(new URL('./color-worker.js', import.meta.url));
let currentCloud = null;

function formatNumber(n) {
      return n.toLocaleString('fr-FR');
}

function showProgress(visible) {
      progressEl.classList.toggle('visible', visible);
}

function showStats(totalPixels, uniqueCount, timeMs) {
      statPixels.textContent = formatNumber(totalPixels);
      statColors.textContent = formatNumber(uniqueCount);
      statCompression.textContent = ((1 - uniqueCount / totalPixels) * 100).toFixed(2) + ' %';
      statTime.textContent = timeMs + ' ms';
      statsEl.classList.add('visible');
}

async function processFile(file) {
      showProgress(true);
      statsEl.classList.remove('visible');
      const t0 = performance.now();

      const { data, width, height } = await loadImage(file);

      worker.postMessage({ data, width, height }, [data]);

      worker.onmessage = (e) => {
            const { positions, colors, uniqueCount, totalPixels } = e.data;
            const elapsed = Math.round(performance.now() - t0);

            disposePointCloud(scene, currentCloud);
            currentCloud = createPointCloud(positions, colors);
            scene.add(currentCloud);

            showProgress(false);
            showStats(totalPixels, uniqueCount, elapsed);
      };
}

fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processFile(file);
});
