const os = require('os');

module.exports = {
  isMac: () => Boolean(os.type().match(/(darwin)/i)),
  isWindows: () => Boolean(os.type().match(/(windows)/i)),
};
