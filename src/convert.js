const sharp = require('sharp');

class Convert {
  constructor(width, height) {
    // === Dimension caps ===
    // Defaults: 1600x1600; allow optional query overrides like ?w=1600&h=1600
    const MAX_W_DEFAULT = 1600;
    const MAX_H_DEFAULT = 1600;
    this.maxW = Math.min(
      Number.parseInt(width, 10) || MAX_W_DEFAULT,
      4096
    );
    this.maxH = Math.min(
      Number.parseInt(height, 10) || MAX_H_DEFAULT,
      4096
    );
  }

  async toWebp(isPng, fileBUffer) {
    const webpOptions = isPng
      ? { quality: 80, nearLossless: true, effort: 6 }
      : { quality: 80, effort: 6 };

    const output = await sharp(fileBUffer, { failOnError: true })
      .rotate() // respect EXIF orientation
      .resize({
        width: this.maxW,
        height: this.maxH,
        fit: 'inside',            // keep aspect ratio, no crop
        withoutEnlargement: true, // never upscale small images
        fastShrinkOnLoad: true,
      })
      .webp(webpOptions)
      .toBuffer();

    return output;
  };
}

module.exports = {
  Convert
};
