const path = require('path');
const { isWindows } = require('../helpers/platform.js');

module.exports = {
  // Returns boundary cli path
  path: () => {
    const name = isWindows() ? 'boundary.exe' : 'boundary';
    return path.resolve(__dirname, '..', '..', 'cli', name);
  }
};
