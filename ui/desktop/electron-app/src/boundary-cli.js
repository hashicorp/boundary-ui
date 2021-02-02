const path = require('path');
const { spawnAsyncJSONPromise, spawnSync } = require('./spawn-promise');

const cliPath = async () => path.resolve(__dirname, '..', 'cli', 'boundary');

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(cliPath()),
  // Initiate connection and return output
  connect: (target_id, token, addr) => {
    const command = [
      'connect',
      `-target-id=${target_id}`,
      `-token=${token}`,
      `-addr=${addr}`,
      '-format=json',
      '--output-json-errors'
    ];
    return spawnAsyncJSONPromise(command);
  },
  // Returns JSON-formatted version information from the CLI
  version: () => {
    const command = [ '-v' ];
    const rawOutput = spawnSync(command);
    let gitRevision = /Git Revision:\s*(?<rev>.*)\n/.exec(rawOutput);
    let versionNumber = /Version Number:\s*(?<ver>.*)\n/.exec(rawOutput);
    if (gitRevision) gitRevision = gitRevision.groups.rev;
    if (versionNumber) versionNumber = versionNumber.groups.ver;
    const formatted = versionNumber
      ? `CLI Version ${versionNumber}; Git Rev ${gitRevision}`
      : `CLI Git Rev ${gitRevision}`;
    return { gitRevision, versionNumber, formatted };
    return rawOutput;
  }
}
