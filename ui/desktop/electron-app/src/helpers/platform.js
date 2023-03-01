/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const os = require('os');

module.exports = {
  isMac: () => Boolean(os.platform().match(/(darwin)/i)),
  isWindows: () => Boolean(os.platform().match(/(win32)/i)),
  isLinux: () => Boolean(os.platform().match(/(linux)/i)),
};
