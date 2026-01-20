/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const { path: boundaryPath } = require('../cli/path.js');
const { spawn, spawnSync } = require('child_process');
const jsonify = require('../utils/jsonify.js');

// You can throw exceptions, or allow them to occur, and this is supported.
// Exceptions thrown in this way will be returned to the UI as an
// IPC rejection. However in most cases, you probably want to return a
// specific exception object of your own design, since Error instances
// originating from the underlying system will be noisey and not very helpful
// to users.
//
//throw new Error('Random error!  Should still work!');
//throw { message: 'Random POJO exception!  Should still work!' };

// For example, you could just reject(error) here, but this is the raw
// error from the underlying exec implementation.  It's not a very
// helpful message for users, so it's recommended to craft nice
// POJO representation and throw it or promise->reject it.
module.exports = {
  /**
   * Spawns an asynchronous child process that is expected to output JSON
   * data on either stdout or stderr.  The process is allowed to continue
   * running after the promise resolves.  This function is intended to launch
   * the local proxy.
   * @param {string[]} command
   * @param {string} token
   * @param {number} timeout Duration in seconds
   * @return {Promise}
   */
  spawnAsyncJSONPromise(command, token, timeout) {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(boundaryPath, command, {
        env: {
          ...process.env,
          BOUNDARY_TOKEN: token,
        },
        timeout: timeout ? timeout * 1000 : undefined,
      });
      let outputStream = '';
      let errorStream = '';

      const processData = (data) => {
        outputStream += data.toString();
        const jsonData = jsonify(outputStream);
        if (jsonData) {
          childProcess.removeAllListeners();
          resolve({ childProcess, response: jsonData });
        }
      };

      childProcess.stdout.on('data', processData);

      // Errors are cli returned json objects
      const processError = (error) => {
        errorStream += error.toString();
        const jsonData = jsonify(errorStream);
        if (jsonData) {
          const error = jsonData.api_error || jsonData.error;
          childProcess.removeAllListeners();
          reject(new Error(error.message));
        }
      };

      childProcess.stderr.on('error', processError);
      childProcess.stderr.on('data', processError);
      // Capture spawn errors
      childProcess.on('error', (error) => reject(error));
    });
  },

  /**
   * Spawn child process and return output immediately.
   * This function is intended for non-connection related tasks.
   * @param {string[]} args
   * @param {object} envVars
   * @param {string} path
   * @returns {{stdout: string | undefined, stderr: string | undefined}}   */
  spawnSync(args, envVars = {}, path = boundaryPath) {
    const childProcess = spawnSync(path, args, {
      // Some of our outputs (namely cache daemon searching) can be very large.
      // This an undocumented hack to allow for an unlimited buffer size which
      // could change at any time. If it does, we should just set an arbitrarily
      // large buffer size or switch to spawn and stream the output and handle
      // killing the process ourselves.
      maxBuffer: undefined,
      env: {
        ...process.env,
        ...envVars,
      },
    });

    const { stdout, stderr, error } = childProcess;

    return { stdout: stdout?.toString(), stderr: stderr?.toString(), error };
  },

  /**
   * Spawn a child process and return a promise.
   * Resolves on any output from stdout or stderr.
   * @param command
   * @param options
   * @param path
   */
  spawn(command, options, path = boundaryPath) {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(path, command, options);
      childProcess.stdout.on('data', (data) => {
        resolve({ childProcess, stdout: data.toString() });
      });
      childProcess.stderr.on('data', (data) => {
        resolve({ childProcess, stderr: data.toString() });
      });
      childProcess.on('error', (err) => reject(err));

      // In case the process has no stdio and didn't error out, resolve a
      // promise once the child process closes so we're not waiting forever.
      // Windows doesn't seem to return any error nor any output from stderr when
      // a timeout occurs so this guarantees we return a response to the caller.
      // Otherwise this should not get hit as we should be returning a response
      // from one of the handlers above.
      childProcess.on('close', () =>
        resolve({
          childProcess,
          stderr: JSON.stringify({ error: 'Process was closed.' }),
        }),
      );
    });
  },
};
