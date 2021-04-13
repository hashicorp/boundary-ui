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
 * Opens the specified URL in an external browser.  Only secure HTTPs URLs are
 * allowed except in the case of localhost (which enables development and
 * testing workflows).  Insecure URLs are allowed in dev mode.
 */
handle('openExternal', async (href) => {
  const isSecure = href.startsWith('https://');
  const isLocalhost = href.startsWith('http://localhost')
    || href.startsWith('http://127.0.0.1');
  if (isSecure || isLocalhost || isDev) {
    // openExternal is necessary in order to display documentation and to
    // support arbitrary OIDC flows.  The protocol is validated (see above).
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
