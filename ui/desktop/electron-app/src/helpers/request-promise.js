/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { net } = require('electron');
const http = require('http');

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
 * requests to the client daemon.
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

        resolve(parsedResponse);
      } catch (e) {
        reject(e);
      }
    });

    if (reqBody) {
      req.write(JSON.stringify(reqBody));
    }
    req.end();
  });

module.exports = { netRequest, unixSocketRequest };