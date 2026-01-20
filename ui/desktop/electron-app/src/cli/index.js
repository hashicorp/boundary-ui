/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const { spawnSync } = require('../helpers/spawn-promise.js');
const { path, isBuiltInCli } = require('./path.js');

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(path),

  isBuiltInCli,

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
