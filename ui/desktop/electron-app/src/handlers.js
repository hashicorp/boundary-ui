const { ipcMain } = require('electron');
const isDev = require('electron-is-dev');

const log = (method, request) => {
  if (isDev) console.log(`[ipc-main](${method}): `, request);
}


/**
 * A demonstration method `getFoobars` which returns an object with a message.
 */
ipcMain.handle('getFoobars', async (event, request) => {
  log('getFoobars', request);
  return {
    message: 'this is a response from an ipcMain handler'
  };
});
