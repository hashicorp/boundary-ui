/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const senderMap = new Map();

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
      // Store sender for this request if it has an id
      if(request?.id && event?.sender) {
        senderMap.set(request.id, event.sender);
      }
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

module.exports.getSender = (id) => senderMap.get(id);
module.exports.removeSender = (id) => senderMap.delete(id);