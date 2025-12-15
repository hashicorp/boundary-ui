/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const { isWindows } = require('../helpers/platform.js');
const shellEnv = require('shell-env');

// Utility function to help correctly set the PATH variable on unix systems
// Inspired by https://github.com/sindresorhus/fix-path
const fixPath = () => {
  if (isWindows()) {
    return;
  }

  const { PATH } = shellEnv.sync();
  process.env.PATH =
    PATH ||
    [
      './node_modules/.bin',
      '/.nodebrew/current/bin',
      '/usr/local/bin',
      process.env.PATH,
    ].join(':');
};

module.exports = fixPath;
