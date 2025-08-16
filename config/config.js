// config.js
const { RESOLUTIONS } = require('./resolutions');

module.exports = {
  RESOLUTIONS,

  image: {
    /**
     * Choose a preset key from RESOLUTIONS.
     * To hardcode custom dimensions instead, set preset to null and fill width/height below.
     */
    preset: 'web-medium',

    // Optional explicit dimensions (used only if preset is null)
    width: null,
    height: null,

    // Safety ceilings to avoid huge memory usage
    ceiling: { width: 4096, height: 4096 },

    // Upload size cap (same as your Multer limit)
    maxBytes: 5 * 1024 * 1024, // 5 MB
  },
};
