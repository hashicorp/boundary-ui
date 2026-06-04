/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcMain } = require('electron');
const isDev = require('electron-is-dev');

const log = (method, request = '', response = '', type = 'log') => {
  const requestString =
    typeof request === 'object' ? JSON.stringify(request) : request;
  // only log in dev mode
  if (isDev) {
    console[type](
      `[ipc] ${method}(${requestString}): `,
      type === 'error' ? 'ERROR' : '',
      response,
    );
  }
};

module.exports = function handle(command, handler) {
  ipcMain.handle(command, async function (event, request) {
    const requestPayload = request;
    try {
      const result = await handler(requestPayload);
      log(command, requestPayload, result);
      return { result };
    } catch (error) {
      log(command, requestPayload, error, 'error');
      return { error };
    }
  });
};
