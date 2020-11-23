const { ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const log = (method, request) => {
  if (isDev) console.log(`[ipc-main](${method}): `, request);
};
const { lookpath } = require('lookpath');
const { exec } = require('child_process');

let origin = 'serve://boundary';

/**
 * Returns the current runtime origin, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
ipcMain.handle('getOrigin', async (event, request) => {
  log('getOrigin', request);
  return origin;
});

/**
 * TODO:  sets the main process origin to the specified value.  This value will
 * be used to rewrite the CSP to allow requests to that origin.  If the origin
 * was not previously set, the main process will set it and restart
 * the renderer.
 *
 * For now, we update the internal origin but do not yet rewrite the CSP.
 */
ipcMain.handle('setOrigin', async (event, request) => {
  log('setOrigin', request);
  origin = request?.data;
  return origin;
});

/**
 * 
 */
ipcMain.handle('connect', async (event, request) => {
  log('connect', request);

  const cliAvailable = await lookpath('boundary');
  // TODO: Add error structure
  if(!cliAvailable) { return 'error'; }

  // call the function
  exec(`boundary connect -target-id=${request.target_id} -token=${request.auth_token}`, (output) => {
    console.log(output);
  }, (error) => {
    console.error(error);
  });
});
