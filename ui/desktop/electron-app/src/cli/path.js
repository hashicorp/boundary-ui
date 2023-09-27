/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const path = require('path');
const { isWindows } = require('../helpers/platform.js');
const isDev = require('electron-is-dev');

module.exports = {
  // Returns boundary cli path
  path: () => {
    const name = isWindows() ? 'boundary.exe' : 'boundary';

    // The CLI will be located in a different location once packaged up in an ASAR
    return isDev
      ? path.resolve(__dirname, '..', '..', 'cli', name)
      : path.resolve(process.resourcesPath, 'cli', name);
  },
};
