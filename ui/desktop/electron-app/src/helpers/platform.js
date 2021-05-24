const os = require('os');

module.exports = {
  isMac: () => Boolean(os.platform().match(/(darwin)/i)),
  isWindows: () => Boolean(os.platform().match(/(win32)/i)),
};
