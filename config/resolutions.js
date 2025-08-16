// resolutions.js (optional separate file)
const RESOLUTIONS = {
  // 16:9 video-style tiers
  '480p':  { width:  854, height:  480 }, // (widescreen 480p)
  '720p':  { width: 1280, height:  720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '2160p': { width: 3840, height: 2160 }, // 4K UHD

  // Handy image caps (keep aspect with fit:'inside')
  'web-medium': { width: 1280, height: 1280 },
  'web-large':  { width: 1600, height: 1600 }, // good default for detail checks
  'square-1080': { width: 1080, height: 1080 }, // social-style square
};

module.exports = { RESOLUTIONS };
