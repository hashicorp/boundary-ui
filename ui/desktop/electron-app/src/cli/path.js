/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const path = require('path');
const { isWindows } = require('../helpers/platform.js');
const isDev = require('electron-is-dev');
const { existsSync } = require('node:fs');

const binaryName = isWindows() ? 'boundary.exe' : 'boundary';
const builtInCliPath = isDev
  ? path.resolve(__dirname, '..', '..', 'cli', binaryName)
  : path.resolve(process.resourcesPath, 'cli', binaryName);

// Return true if the CLI in usage is the built in. False if relies on system CLI.
const isBuiltInCli = existsSync(builtInCliPath);

/**
 * Returns Boundary CLI path if the CLI is built in or the Boundary binary name
 * if not, so we assume boundary is available within user $PATH.
 */
const pathBoundary = isBuiltInCli ? builtInCliPath : binaryName;

module.exports = {
  path: pathBoundary,
  isBuiltInCli,
};
