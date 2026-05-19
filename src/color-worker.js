const MAX_POINTS = 500_000;

function sampleColors(colorMap, maxPoints) {
      if (colorMap.size <= maxPoints) return colorMap;
      const keys = Array.from(colorMap.keys());
      const step = keys.length / maxPoints;
      const sampled = new Map();
      for (let i = 0; i < maxPoints; i++) {
            const key = keys[Math.floor(i * step)];
            sampled.set(key, 1);
      }
      return sampled;
}

function extractColors(pixels) {
      const colorMap = new Map();
      for (let i = 0; i < pixels.length; i += 4) {
            const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
            if (!colorMap.has(key)) {
                  colorMap.set(key, 1);
            }
      }
      return colorMap;
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

      const fullMap = extractColors(pixels);
      const uniqueCount = fullMap.size;
      const sampled = sampleColors(fullMap, limit);
      const { positions, colors } = buildBuffers(sampled);

      self.postMessage(
            { positions, colors, uniqueCount, displayedCount: sampled.size, totalPixels },
            [positions.buffer, colors.buffer]
      );
};
