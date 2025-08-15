const sharp = require('sharp');

// === Dimension caps ===
// Defaults: 1600x1600; allow optional query overrides like ?w=1600&h=1600
const MAX_W_DEFAULT = 1600;
const MAX_H_DEFAULT = 1600;
let maxW = Math.min(
  MAX_W_DEFAULT, 4096 // hard safety ceiling
);
let maxH = Math.min(
  MAX_H_DEFAULT, 4096
);

const setImageMax = function(width, height) {
  maxW = Math.min(
    Number.parseInt(width, 10) || MAX_W_DEFAULT,
    4096
  );
  maxH = Math.min(
    Number.parseInt(height, 10) || MAX_H_DEFAULT,
    4096
  );
};

const CONVERT = async function(isPng, fileBUffer) {
  const webpOptions = isPng
    ? { quality: 80, nearLossless: true, effort: 6 }
    : { quality: 80, effort: 6 };

  const output = await sharp(fileBUffer, { failOnError: true })
    .rotate() // respect EXIF orientation
    .resize({
      width: maxW,
      height: maxH,
      fit: 'inside',            // keep aspect ratio, no crop
      withoutEnlargement: true, // never upscale small images
      fastShrinkOnLoad: true,
    })
    .webp(webpOptions)
    .toBuffer();

  return output;
};

module.exports = {
  CONVERT,
  setImageMax
};
