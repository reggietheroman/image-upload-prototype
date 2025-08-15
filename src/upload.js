const multer = require('multer');

// === Size limit ===
// For web apps, 5 MB per image is a solid default (keeps memory/latency in check and covers high‑quality photos).
// You can bump to 10 MB if you expect huge camera originals.
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Multer in-memory storage so we can pipe directly into Sharp and avoid temp files.
const UPLOAD = multer({
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

module.exports = { UPLOAD }
