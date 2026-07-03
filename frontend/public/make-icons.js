const fs = require('fs');
const { createCanvas, Image } = require('canvas');

// Kita lewati pembuatan icon otomatis, fallback ke SVG proxy config vite PWA 
// karena Image / Canvas module susah dibuild di terminal tanpa toolchain.
