const handle = require('./ipc-handler');
const boundaryCli = require('./boundary-cli');
const origin = require('./origin.js');

/**
 * Returns the current runtime origin, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
handle('getOrigin', () => origin.origin);

/**
 * Sets the origin to be used in the content security policy and triggers
 * a main window reload.
 */
handle('setOrigin', async (requestOrigin) => {
  await origin.validateOrigin(requestOrigin);
  origin.origin = requestOrigin;
});

/**
 * Resets the origin.
 */
handle('resetOrigin', async (requestOrigin) => {
  origin.resetOrigin();
});

/**
 * Check for boundary cli existence
 */
handle('cliExists', () => boundaryCli.exists());

/**
 * Establishes a boundary session and returns session details.
 */
handle('connect', ({ target_id, token, host_id }) =>
  boundaryCli.connect(target_id, token, host_id)
);
