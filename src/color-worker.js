const MAX_POINTS = 500_000;

function sampleColors(colorMap, maxPoints, darkestKey) {
      if (colorMap.size <= maxPoints) return colorMap;
      const keys = Array.from(colorMap.keys());
      const step = keys.length / maxPoints;
      const sampled = new Map();
      sampled.set(darkestKey, 1);
      let taken = 1;
      for (let i = 0; i < maxPoints && taken < maxPoints; i++) {
            const key = keys[Math.floor(i * step)];
            if (!sampled.has(key)) {
                  sampled.set(key, 1);
                  taken++;
            }
      }
      return sampled;
}

function extractColors(pixels) {
      const colorMap = new Map();
      let darkestKey = -1;
      let darkestLuma = Infinity;
      for (let i = 0; i < pixels.length; i += 4) {
            const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
            if (pixels[i] !== 0 && pixels[i + 1] !== 0 && pixels[i + 2] !== 0) {
                  const luma = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
                  if (luma < darkestLuma) {
                        darkestLuma = luma;
                        darkestKey = key;
                  }
            }
            if (!colorMap.has(key)) {
                  colorMap.set(key, 1);
            }
      }
      return { colorMap, darkestKey };
}

function buildBuffers(colorMap) {
      const count = colorMap.size;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      let idx = 0;
      for (const key of colorMap.keys()) {
            const r = (key >> 16) & 0xff;
            const g = (key >> 8) & 0xff;
            const b = key & 0xff;
            const i3 = idx * 3;
            positions[i3] = r;
            positions[i3 + 1] = g;
            positions[i3 + 2] = b;
            colors[i3] = r / 255;
            colors[i3 + 1] = g / 255;
            colors[i3 + 2] = b / 255;
            idx++;
      }
      return { positions, colors };
}

self.onmessage = function (e) {
      const { data, width, height, maxPoints } = e.data;
      const pixels = new Uint8ClampedArray(data);
      const totalPixels = width * height;
      const limit = maxPoints || MAX_POINTS;

      const { colorMap, darkestKey } = extractColors(pixels);
      const uniqueCount = colorMap.size;
      const sampled = sampleColors(colorMap, limit, darkestKey);
      const { positions, colors } = buildBuffers(sampled);

      self.postMessage(
            { positions, colors, uniqueCount, displayedCount: sampled.size, totalPixels, darkestKey },
            [positions.buffer, colors.buffer]
      );
};
