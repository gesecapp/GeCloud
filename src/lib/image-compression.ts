/**
 * Comprime uma imagem base64 para JPEG com tamanho máximo controlado.
 * Redimensiona proporcionalmente se exceder maxDimension e comprime iterativamente.
 */
export async function compressImageToBase64(dataUrl: string, options?: { maxDimension?: number; targetSizeKB?: number }): Promise<string> {
  const maxDimension = options?.maxDimension ?? 1024;
  const targetSizeBytes = (options?.targetSizeKB ?? 190) * 1024;

  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Falha ao criar contexto 2D do canvas');

  ctx.drawImage(img, 0, 0, width, height);

  let currentQuality = 0.9;
  let compressed = '';
  let iteration = 0;
  const maxIterations = 5;

  do {
    compressed = canvas.toDataURL('image/jpeg', currentQuality);
    const sizeBytes = compressed.length * 0.75;
    if (sizeBytes <= targetSizeBytes || iteration >= maxIterations) break;
    currentQuality -= 0.1;
    iteration++;
  } while (iteration <= maxIterations && currentQuality > 0.1);

  return compressed;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = dataUrl;
  });
}
