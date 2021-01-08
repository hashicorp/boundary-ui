const handle = require('./ipc-handler');
const boundaryCli = require('./boundary-cli');
const runtimeSettings = require('./runtime-settings.js');

/**
 * Returns the current runtime origin, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
handle('getOrigin', () => runtimeSettings.origin);

/**
 * Sets the origin to be used in the content security policy and triggers
 * a main window reload.
 */
handle('setOrigin', (requestOrigin) => runtimeSettings.origin = requestOrigin);

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
handle('connect', ({ target_id, token, addr }) => boundaryCli.connect(target_id, token, addr));
