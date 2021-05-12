const path = require('path');
const { spawn, spawnSync } = require('child_process');
const spawnSession = require('./spawn-session');

const boundaryPath = path.resolve(__dirname, '..', 'cli', 'boundary');

// Convert to json
const jsonify = (data) => {
  if (typeof data !== 'string') data = JSON.stringify(data);
  try {
    return JSON.parse(data);
  } catch (e) {
    // Ignore parse errors
  }
};

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
      const childProcess = spawn(boundaryPath, command);
      let outputStream = '';
      let errorStream = '';

      childProcess.stdout.on('data', (data) => {
        outputStream += data.toString();
        const jsonData = jsonify(outputStream);
        if (jsonData) {
          // if (jsonData.termination_reason) {
          //   spawnSession.cancelProcess(childProcess.pid);
          // } else {
          //   // Track only successfully launched child processes
          //   spawnSession.add({ childProcess, data: jsonData });
          // }
          // FIXME
          // outputStream = '';
          resolve({ childProcess, response: jsonData });
        }
      });

      // @todo Cancel spawned session childprocess on error? Does it get automatically cancelled?
      // @todo on error - should childprocess be closed?
      // Test on connection limit errors especially
      childProcess.stderr.on('data', (data) => {
        errorStream += data.toString();
        const jsonData = jsonify(errorStream);
        if (jsonData) {
          const error = jsonData.api_error || jsonData.error;
          // FIXME
          // errorStream = '';
          reject(new Error(error.message));
        }
      });
    });
  },

  /**
   * Spawn child process and return output immediately.
   * This function is intended for non-connection related tasks.
   * @param {string} command
   * @return {string}
   */
  spawnSync(command) {
    const childProcess = spawnSync(boundaryPath, command);
    const rawOutput = childProcess.output.toString();
    return rawOutput;
  },
};
