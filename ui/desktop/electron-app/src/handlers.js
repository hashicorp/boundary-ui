const { shell } = require('electron');
const isDev = require('electron-is-dev');
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
 * Opens the specified URL in an external browser.  Only HTTPS URLs are allowed,
 * except in development where all protocols are allowed.
 */
handle('openExternal', async (href) => {
  if (href.startsWith('https://') || isDev) {
    // openExternal is necessary in order to display documentation and to
    // support arbitrary OIDC flows.  The protocol is validated.
    shell.openExternal(href); /* eng-disable OPEN_EXTERNAL_JS_CHECK */
  } else {
    throw new Error(
      `URLs may only be opened over HTTPS in an external browser.
       The URL '${href}' could not be opened.`
    );
  }
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
