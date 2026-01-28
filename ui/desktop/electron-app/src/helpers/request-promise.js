/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { net } = require('electron');
const http = require('http');
const log = require('electron-log/main');

const requestTimeoutSeconds = 10;
// Simple promise wrapper around Electron's net.request feature.
// https://www.electronjs.org/docs/api/client-request
const netRequest = (url) =>
  new Promise((resolve, reject) => {
    try {
      const request = net.request(url);
      // We don't worry about canceling the request timeout timer once a
      // request ends because:  request.abort() has no effect after a request
      // ends and the promise will already have been completed, so a rejection
      // has no effect either.
      const requestTimeout = setTimeout(() => {
        request.abort();
        reject(new Error('Request timeout'));
      }, requestTimeoutSeconds * 1000);
      request.on('error', reject);
      request.on('response', resolve);
      request.end();
    } catch (e) {
      reject(e);
    }
  });

/**
 * Promise wrapper around node's http request function. The primary
 * use case is to pass in a socket path to be able to make http
 * requests to the cache daemon.
 * @param options
 * @param reqBody
 * @returns {Promise}
 */
const unixSocketRequest = (options, reqBody) =>
  new Promise((resolve, reject) => {
    const req = http.request(options);
    req.once('error', reject);
    req.once('response', async (res) => {
      const bufs = [];
      for await (const buf of res) {
        bufs.push(buf);
      }

      try {
        let parsedResponse;
        const response = Buffer.concat(bufs);
        if (response.length > 0) {
          parsedResponse = JSON.parse(response);
        }

        // Reject the response if the status code is not in the 2xx range.
        const { statusCode } = res;
        if (statusCode < 200 || statusCode >= 400) {
          reject({
            statusCode,
            message: parsedResponse?.message ?? parsedResponse?.error,
          });
        }

        resolve(parsedResponse);
      } catch (e) {
        log.error(
          `unixSocketRequest(${JSON.stringify({
            path: options.path,
            socketPath: options.socketPath,
          })}):`,
          e.message,
        );

        reject(e);
      }
    });

    if (reqBody) {
      req.write(JSON.stringify(reqBody));
    }
    req.end();
  });

module.exports = { netRequest, unixSocketRequest };
