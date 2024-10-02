/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const path = require('path');
const { isWindows } = require('../helpers/platform.js');
const isDev = require('electron-is-dev');
const { existsSync } = require('node:fs');
const which = require('which');
const log = require('electron-log/main');

const binaryName = isWindows() ? 'boundary.exe' : 'boundary';
const builtInCliPath = isDev
  ? path.resolve(__dirname, '..', '..', 'cli', binaryName)
  : path.resolve(process.resourcesPath, 'cli', binaryName);

// Return true if the CLI in usage is the built in. False if relies on system CLI.
const isBuiltInCli = existsSync(builtInCliPath);

/**
 * Returns Boundary CLI path if the CLI is built in or the Boundary binary name
 * if not, so we assume boundary is available within user $PATH.
 * For Windows, we filter out the path that is within the current working directory.
 */
const pathBoundary = isBuiltInCli
  ? builtInCliPath
  : isWindows()
    ? which.sync(binaryName, { nothrow: true, all: true })
      .filter((binary) => !binary.startsWith(process.cwd()))[0]
    : binaryName;

log.info('pathBoundary', pathBoundary)
console.log(pathBoundary)

module.exports = {
  path: pathBoundary,
  isBuiltInCli,
};
