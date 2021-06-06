const path = require('path');
const { isWindows } = require('../helpers/platform.js');

module.exports = {
  // Returns boundary cli path
  path: () => {
    let name = 'boundary';
    if (isWindows()) name = 'boundary.exe';
    return path.resolve(__dirname, '..', '..', 'cli', name);
  }
};
