/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { spawnSync } = require('../helpers/spawn-promise.js');
const { path } = require('./path.js');

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(path()),

  carlosTest: () => {
    try {
      const command = ['-v'];
      const { stdout } = spawnSync(command);

      console.log('Here it comes stdout:');
      console.log(stdout);
    } catch (error) {
      console.log('Erro was catched: ', error);
    }
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
