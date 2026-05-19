const MAX_PIXELS = 16_777_216;

export function loadImage(file) {
      return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                  URL.revokeObjectURL(url);

                  let { width, height } = img;
                  const totalPixels = width * height;

                  if (totalPixels > MAX_PIXELS) {
                        const scale = Math.sqrt(MAX_PIXELS / totalPixels);
                        width = Math.floor(width * scale);
                        height = Math.floor(height * scale);
                  }

                  const canvas = new OffscreenCanvas(width, height);
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);

                  const imageData = ctx.getImageData(0, 0, width, height);
                  resolve({
                        data: imageData.data.buffer,
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                  });
            };

            img.onerror = () => {
                  URL.revokeObjectURL(url);
                  reject(new Error('Impossible de charger l\'image'));
            };

            img.src = url;
      });
}
