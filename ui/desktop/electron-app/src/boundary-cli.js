const path = require('path');
const spawnPromise = require('./spawn-promise');

const cliPath = async () => path.resolve(__dirname, '..', 'cli', 'boundary');

module.exports = {
  // Find boundary cli path
  path: () => cliPath(),
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
    return spawnPromise(command);
  }
}
