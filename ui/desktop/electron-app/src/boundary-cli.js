const path = require('path');
const { spawnSync } = require('./helpers/spawn-promise.js');

const cliPath = async () => path.resolve(__dirname, '..', 'cli', 'boundary');

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(cliPath()),

  // Returns JSON-formatted version information from the CLI
  version: () => {
    const command = ['-v'];
    const rawOutput = spawnSync(command);
    let gitRevision = /Git Revision:\s*(?<rev>.*)\n/.exec(rawOutput);
    let versionNumber = /Version Number:\s*(?<ver>.*)\n/.exec(rawOutput);
    if (gitRevision) gitRevision = gitRevision.groups.rev;
    if (versionNumber) versionNumber = versionNumber.groups.ver;
    const formatted = versionNumber
      ? `CLI Version:  ${versionNumber}\nCLI Commit:  ${gitRevision}`
      : `CLI Commit:  ${gitRevision}`;
    return { gitRevision, versionNumber, formatted };
  },
};
