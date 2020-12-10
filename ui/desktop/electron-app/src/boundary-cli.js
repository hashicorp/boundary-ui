const { lookpath } = require('lookpath');
const spawnPromise = require('./spawn-promise');

const cliPath = async () => await lookpath('boundary');

module.exports = {
  // Find boundary cli path
  path: () => cliPath(),
  // Check boundary cli existence
  exists: () => Boolean(cliPath()),
  // Initiate connection and return output
  connect: (target_id, token) => {
    const command = [
      'connect',
      `-target-id=${target_id}`,
      `-token=${token}`,
      '-format=json',
      '--output-json-errors'
    ]
    return spawnPromise(command);
  }
}