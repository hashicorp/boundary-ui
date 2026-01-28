/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const os = require('os');

module.exports = {
  isMac: () => Boolean(os.platform().match(/(darwin)/i)),
  isWindows: () => Boolean(os.platform().match(/(win32)/i)),
  isLinux: () => Boolean(os.platform().match(/(linux)/i)),
};
