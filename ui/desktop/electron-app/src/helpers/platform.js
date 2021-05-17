const os = require('os');

const isMac = () => Boolean(os.type().match(/darwin/i));
const isWindows = () => Boolean(os.type().match(/(windows)/i));

module.exports = {
    isMac: isMac,
    isWindows: isWindows,
}