/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const path = require('path');
const { isWindows } = require('../helpers/platform.js');
const isDev = require('electron-is-dev');
const { existsSync } = require('node:fs');

module.exports = {
  /**
   * Returns Boundary CLI path if the CLI is built in or the Boundary binary name
   * if not, so we assume boundary is available within user $PATH.
   */
  path: () => {
    // const binaryName = isWindows() ? 'boundary.exe' : 'boundary';
    const binaryName = 'boundar';
    const builtInCliPath = isDev
      ? path.resolve(__dirname, '..', '..', 'cli', binaryName)
      : path.resolve(process.resourcesPath, 'cli', binaryName);
    const isBuiltInCli = existsSync(builtInCliPath);

    return isBuiltInCli ? builtInCliPath : binaryName;
  },
};
