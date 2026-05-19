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
const statDisplayed = document.getElementById('stat-displayed');
const statCompression = document.getElementById('stat-compression');
const statTime = document.getElementById('stat-time');
const densityWrapper = document.getElementById('density-wrapper');
const densitySlider = document.getElementById('density-slider');
const densityValue = document.getElementById('density-value');

const { scene, requestRender } = createScene(container);
scene.add(createCubeHelper());
requestRender();

const worker = new Worker(new URL('./color-worker.js', import.meta.url));
let currentCloud = null;
let lastImageBuffer = null;
let lastWidth = 0;
let lastHeight = 0;

function formatNumber(n) {
      return n.toLocaleString('fr-FR');
}

function formatK(n) {
      return n >= 1000 ? Math.round(n / 1000) + 'k' : String(n);
}

function showProgress(visible) {
      progressEl.classList.toggle('visible', visible);
}

function showStats(totalPixels, uniqueCount, displayedCount, timeMs) {
      statPixels.textContent = formatNumber(totalPixels);
      statColors.textContent = formatNumber(uniqueCount);
      statDisplayed.textContent = formatNumber(displayedCount);
      statCompression.textContent = ((1 - uniqueCount / totalPixels) * 100).toFixed(2) + ' %';
      statTime.textContent = timeMs + ' ms';
      statsEl.classList.add('visible');
}

function processWithWorker(buffer, width, height, maxPoints) {
      const copy = buffer.slice(0);
      worker.postMessage({ data: copy, width, height, maxPoints }, [copy]);
}

worker.onmessage = (e) => {
      const { positions, colors, uniqueCount, displayedCount, totalPixels } = e.data;
      const elapsed = Math.round(performance.now() - worker._t0);

      disposePointCloud(scene, currentCloud);
      currentCloud = createPointCloud(positions, colors);
      scene.add(currentCloud);
      requestRender();

      showProgress(false);
      showStats(totalPixels, uniqueCount, displayedCount, elapsed);
};

async function processFile(file) {
      showProgress(true);
      statsEl.classList.remove('visible');

      const { data, width, height } = await loadImage(file);
      lastImageBuffer = data;
      lastWidth = width;
      lastHeight = height;

      densityWrapper.classList.add('visible');

      worker._t0 = performance.now();
      processWithWorker(lastImageBuffer, lastWidth, lastHeight, parseInt(densitySlider.value));
}

let debounceTimer = null;
densitySlider.addEventListener('input', () => {
      densityValue.textContent = formatK(parseInt(densitySlider.value));
      if (!lastImageBuffer) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
            showProgress(true);
            worker._t0 = performance.now();
            processWithWorker(lastImageBuffer, lastWidth, lastHeight, parseInt(densitySlider.value));
      }, 150);
});

fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processFile(file);
});
