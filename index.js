const express = require('express');
const { fileTypeFromBuffer } = require('file-type');
const { UPLOAD } = require('./src/upload.js');
const { Convert } = require('./src/convert.js');

const app = express();

app.post('/convert', UPLOAD.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "image".' });
    }

    // Verify actual file type by magic bytes (don’t trust client MIME).
    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (!detected || !detected.mime.startsWith('image/')) {
      return res.status(415).json({ error: 'Unsupported or invalid image file.' });
    }

    // Convert to WebP:
    // - effort: 6 is a good balance (range 0–6 in Sharp; higher = slower/smaller)
    // - quality: 80 is a strong default for “smallest with minimal perceived loss”
    // - If the source is PNG (often graphics), nearLossless can help preserve crisp lines while still shrinking.
    const isPng = detected.mime === 'image/png';

    const converter = new Convert(req.query.w, req.query.h);
    const output = await converter.toWebp(isPng, req.file.buffer);

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
