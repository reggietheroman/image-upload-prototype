// index.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { fileTypeFromBuffer } = require('file-type');

const app = express();

// === Size limit ===
// For web apps, 5 MB per image is a solid default (keeps memory/latency in check and covers high‑quality photos).
// You can bump to 10 MB if you expect huge camera originals.
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Multer in-memory storage so we can pipe directly into Sharp and avoid temp files.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    // Quick MIME check (defense-in-depth: we'll sniff magic bytes after upload too)
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

app.post('/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "image".' });
    }

    // Verify actual file type by magic bytes (don’t trust client MIME).
    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (!detected || !detected.mime.startsWith('image/')) {
      return res.status(415).json({ error: 'Unsupported or invalid image file.' });
    }

    // === Dimension caps ===
    // Defaults: 1600x1600; allow optional query overrides like ?w=1600&h=1600
    const MAX_W_DEFAULT = 1600;
    const MAX_H_DEFAULT = 1600;
    const maxW = Math.min(
      Number.parseInt(req.query.w, 10) || MAX_W_DEFAULT,
      4096 // hard safety ceiling
    );
    const maxH = Math.min(
      Number.parseInt(req.query.h, 10) || MAX_H_DEFAULT,
      4096
    );

    // Convert to WebP:
    // - effort: 6 is a good balance (range 0–6 in Sharp; higher = slower/smaller)
    // - quality: 80 is a strong default for “smallest with minimal perceived loss”
    // - If the source is PNG (often graphics), nearLossless can help preserve crisp lines while still shrinking.
    const isPng = detected.mime === 'image/png';

    const webpOptions = isPng
      ? { quality: 80, nearLossless: true, effort: 6 }
      : { quality: 80, effort: 6 };

    const output = await sharp(req.file.buffer, { failOnError: true })
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

    // Respond with the converted WebP bytes.
    // You can also save to disk or S3 if you prefer.
    const baseName = (req.file.originalname || 'image').replace(/\.[^.]+$/, '');
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Disposition', `inline; filename="${baseName}.webp"`);
    res.send(output);
  } catch (err) {
    const message =
      err?.message?.includes('File too large')
        ? `File exceeds ${Math.round(MAX_BYTES / (1024 * 1024))} MB limit.`
        : err?.message || 'Conversion failed.';
    res.status(400).json({ error: message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Image service listening on http://localhost:${PORT}`);
});