const handle = require('./ipc-handler');
const { lookpath } = require('lookpath');
const { exec } = require('child_process');

let origin = '';

/**
 * Returns the current runtime origin, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
handle('getOrigin', () => origin);

/**
 * TODO:  sets the main process origin to the specified value.  This value will
 * be used to rewrite the CSP to allow requests to that origin.  If the origin
 * was not previously set, the main process will set it and restart
 * the renderer.
 *
 * For now, we update the internal origin but do not yet rewrite the CSP.
 */
handle('setOrigin', (requestOrigin) => origin = requestOrigin);

/**
 * Establishes a boundary session and returns session details.
 * TODO: Return session details.
 */
handle('connect', async ({ target_id, token }) => {
  const cliAvailable = await lookpath('boundary');
  if(!cliAvailable) { throw new Error('CLI unavailable.'); }

  const connectCmd = `boundary connect -target-id=${target_id} -token=${token}`;

  // TODO:  this isn't the *exact* promise, because apparently exec doesn't
  // call the success callback until the process exits.  We need a way to
  // resolve the promise if the process doesn't exit AND we receive valid
  // JSON on stdout, since this indicates the connection was successful.
  //
  // TODO:  if there is an existing promiserified exec tool, we might consider
  // using it to help make this cleaner.

  // You can throw exceptions, or allow them to occur, and this is supported.
  // Exceptions thrown in this way will be returned to the UI as an
  // IPC rejection. However in most cases, you probably want to return a
  // specific exception object of your own design, since Error instances
  // originating from the underlying system will be noisey and not very helpful
  // to users.
  //
  //throw new Error('Random error!  Should still work!');
  //throw { message: 'Random POJO exception!  Should still work!' };

  return new Promise((resolve, reject) => {
    exec(connectCmd, (error, stdout, stderr) => {
      if (error) {
        // For example, you could just reject(error) here, but this is the raw
        // error from the underlying exec implementation.  It's not a very
        // helpful message for users, so it's recommended to craft nice
        // POJO representation and throw it or promise->reject it.
        //
        // TODO:  connection errors may now return JSON on stderr, which we
        // would attempt to parse here to use a basis for rejection.
        const { code } = error;
        return reject({
          code,
          message: `OH NOSE!  Command failed with code ${code}`
        });
      }
      return resolve(stdout);
    });
  });
});
