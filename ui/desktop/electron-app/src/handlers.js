const handle = require('./ipc-handler');
const { lookpath } = require('lookpath');
const spawnPromise = require('./spawn-promise');

let origin = '';

/**
 * Returns the current runtime origin, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
handle('getOrigin', () => origin);

/**
 * TODO:  sets the main process origin to the specified value.  This value will
 * be used to rewrite the CSP to allow requests to that origin.  If the origin
 * was not previously set, the main process will set it and restart
 * the renderer.
 *
 * For now, we update the internal origin but do not yet rewrite the CSP.
 */
handle('setOrigin', (requestOrigin) => origin = requestOrigin);

/**
 * Detect boundary cli in env path
 */
handle('cli', async () => {
  const cliPath = await lookpath('boundary');
  if(!cliPath) throw new Error({ message: 'Cannot find boundary cli.'})
  return cliPath;
});

/**
 * Establishes a boundary session and returns session details.
 */
handle('connect', async ({ target_id, token }) => {
  const connectCmd = [
    'connect',
    `-target-id=${target_id}`,
    `-token=${token}`,
    '-format=json',
    '--output-json-errors'
  ];
  return spawnPromise(connectCmd);
});
