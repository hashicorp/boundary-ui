const { path } = require('../cli/path.js');
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
   * @param {string} command
   * @return {Promise}
   */
  spawnAsyncJSONPromise(command) {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(path(), command);
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
   * @param {string} command
   * @return {string}
   */
  spawnSync(command) {
    const childProcess = spawnSync(path(), command);
    const rawOutput = childProcess.output.toString();
    return rawOutput;
  },
};
