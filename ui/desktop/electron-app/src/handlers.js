const handle = require('./ipc-handler');
const boundaryCli = require('./boundary-cli');


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
 * Check for boundary cli existence
 */
handle('cliExists', () => boundaryCli.exists());

/**
 * Detect boundary cli path
 */
handle('cliPath', () => boundaryCli.path());

/**
 * Establishes a boundary session and returns session details.
 */
handle('connect', ({ target_id, token }) => boundaryCli.connect(target_id, token));
