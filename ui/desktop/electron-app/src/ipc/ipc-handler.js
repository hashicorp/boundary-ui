/**
 * Copyright IBM Corp. 2024, 2026
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
    let result;
    try {
      result = await handler(requestPayload);
      log(command, requestPayload, result);
    } catch (e) {
      // If e is an Error instance, we need to extract the message and wrap
      // it in a POJO before stringifying it.  If not an Error, e is assumed to
      // be already a POJO.
      const errorMessage = e instanceof Error ? { message: e.message } : e;
      result = new Error(JSON.stringify(errorMessage));
      log(command, requestPayload, e, 'error');
    }
    return result;
  });
};
