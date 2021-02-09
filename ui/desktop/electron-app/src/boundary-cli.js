const path = require('path');
const { spawnAsyncJSONPromise, spawnSync } = require('./spawn-promise');
const origin = require('./origin.js');

const cliPath = async () => path.resolve(__dirname, '..', 'cli', 'boundary');

/**
 * Super paranoid shell quote/escape and validation.  Input must be base62.
 * @param {string} str
 */
const escapeAndValidateBase62 = (str) => {
  const candidate = str.toString();
  if (candidate.match(/^[A-Za-z0-9_]*$/)) return candidate;
  throw new Error(`
    Could not invoke command:
    input contained unsafe characters.
  `);
};

module.exports = {
  // Check boundary cli existence
  exists: () => Boolean(cliPath()),
  // Initiate connection and return output
  connect: (target_id, token, host_id) => {
    const addr = origin.origin;
    const sanitized = {
      target_id: escapeAndValidateBase62(target_id),
      token: escapeAndValidateBase62(token)
    };
    if (host_id) sanitized.host_id = escapeAndValidateBase62(host_id);
    const command = [
      'connect',
      `-target-id=${sanitized.target_id}`,
      `-token=${sanitized.token}`,
      `-addr=${addr}`,
      '-format=json',
      '--output-json-errors'
    ];

    if (host_id) command.push(`-host-id=${sanitized.host_id}`)
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
      ? `CLI Version ${versionNumber}; CLI Git Rev ${gitRevision}`
      : `CLI Git Rev ${gitRevision}`;
    return { gitRevision, versionNumber, formatted };
    return rawOutput;
  }
}
