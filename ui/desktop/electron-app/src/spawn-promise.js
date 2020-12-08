const { spawn } = require('child_process');

/**
 * Attempt to parse output string to JSON.
 * When JSON is successfully parsed, consider stdout fully read.
*/
// TODO: Potential use for BufferList?
const resolveOutput = (resolve, outputStream) => {
  try {
    resolve(JSON.parse(outputStream));
  } catch (e) {
    // Ignore JSON parse errors while stdout buffers.
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
const rejectError = (reject, message) => {
  try {
    const errorMessage = JSON.parse(message);
    reject(new Error(errorMessage.error));
  } catch (e) {
    // Ignore JSON parse errors while stderr buffers.
  }
};

module.exports = function spawnPromise (command) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('boundary', command);
    let outputStream = '';
    let errorStream = '';

    childProcess.stdout.on('data', (data) => {
      outputStream += data.toString();
      resolveOutput(resolve, outputStream);
    });

    childProcess.stderr.on('data', (data) => {
      errorStream += data.toString();
      rejectError(reject, errorStream);
    });
  });
}