const { net } = require('electron');

const requestTimeoutSeconds = 10;
// Simple promise wrapper around Electron's net.request feature.
// https://www.electronjs.org/docs/api/client-request
const netRequestPromise = (url) =>
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
