/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { spawnSync } = require('../helpers/spawn-promise.js');
const { path } = require('./path.js');
const pathPosix = require('path');
const pathWin = require('path/win32');
const { isWindows } = require('../helpers/platform.js');

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(path()),

  // Return true if the CLI in usage is the built in. False if relies on system CLI.
  isBuiltInCli: () => {
    const pathToParse = path();
    const pathParsed = isWindows()
      ? pathWin.parse(pathToParse)
      : pathPosix.parse(pathToParse);

    if (pathParsed.dir === '' && pathParsed.root === '') {
      return false;
    }
    return true;
  },

  // Returns JSON-formatted version information from the CLI
  version: () => {
    const command = ['-v'];
    const { stdout } = spawnSync(command);
    let gitRevision = /Git Revision:\s*(?<rev>.*)\n/.exec(stdout);
    let versionNumber = /Version Number:\s*(?<ver>.*)\n/.exec(stdout);
    if (gitRevision) gitRevision = gitRevision.groups.rev;
    if (versionNumber) versionNumber = versionNumber.groups.ver;
    const formatted = versionNumber
      ? `CLI Version:  ${versionNumber}\nCLI Commit:  ${gitRevision}`
      : `CLI Commit:  ${gitRevision}`;
    return { gitRevision, versionNumber, formatted };
  },
};
