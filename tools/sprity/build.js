var sprite = require('sprity');
sprite.create({
  src: './src/assets/sprites/icons/*.png',
  out: './src/assets/sprites/',
  name: 'sprites',
  style: './sprites.scss',
  processor: 'sass',
  cssPath: '../../../assets/sprites/',
  'style-type': 'scss',
  'dimension': [{
    ratio: 1, dpi: 72
  }, {
    ratio: 2, dpi: 192
  }]
}, function () {
  console.log('css sprites done, please copy @import \'../../../assets/sprites/sprites\';');
});