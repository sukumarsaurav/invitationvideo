/**
 * Centre-crops a photo to the slot's aspect ratio and shrinks it, returning a JPEG data URL.
 * Phase 2 replaces the data URL with a direct upload to R2 and adds a manual cropper.
 */
export const preparePhoto = async (file: File, aspectRatio: number, maxSide = 1080): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const srcRatio = bitmap.width / bitmap.height;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (srcRatio > aspectRatio) sw = Math.round(bitmap.height * aspectRatio);
  else sh = Math.round(bitmap.width / aspectRatio);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);

  const scale = Math.min(1, maxSide / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser');
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
};
