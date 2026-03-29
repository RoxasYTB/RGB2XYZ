self.onmessage = function (e) {
      const { data, width, height } = e.data;
      const pixels = new Uint8ClampedArray(data);
      const totalPixels = width * height;

      const colorMap = new Map();
      const CHUNK = 65536;

      for (let offset = 0; offset < pixels.length; offset += CHUNK * 4) {
            const end = Math.min(offset + CHUNK * 4, pixels.length);
            for (let i = offset; i < end; i += 4) {
                  const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
                  if (!colorMap.has(key)) {
                        colorMap.set(key, 1);
                  }
            }
      }

      const uniqueCount = colorMap.size;
      const positions = new Float32Array(uniqueCount * 3);
      const colors = new Float32Array(uniqueCount * 3);

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

      self.postMessage(
            { positions, colors, uniqueCount, totalPixels },
            [positions.buffer, colors.buffer]
      );
};
