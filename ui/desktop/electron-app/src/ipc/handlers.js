/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { app, shell, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const handle = require('./ipc-handler.js');
const boundaryCli = require('../cli/index.js');
const sessionManager = require('../services/session-manager.js');
const runtimeSettings = require('../services/runtime-settings.js');
const sanitizer = require('../utils/sanitizer.js');
const { isMac } = require('../helpers/platform.js');

/**
 * Returns the current runtime clusterUrl, which is used by the main thread to
 * rewrite the CSP to allow requests.
 */
handle('getClusterUrl', () => runtimeSettings.clusterUrl);

/**
 * Sets the clusterUrl to be used in the content security policy and triggers
 * a main window reload.
 */
handle('setClusterUrl', async (requestOrigin) => {
  const clusterUrl = sanitizer.urlValidate(requestOrigin);
  await runtimeSettings.validateClusterUrl(clusterUrl);
  runtimeSettings.clusterUrl = clusterUrl;
});

/**
 * Resets the clusterUrl.
 */
handle('resetClusterUrl', async () => runtimeSettings.resetClusterUrl());

/**
 * Opens the specified URL in an external browser.  Only secure HTTPs URLs are
 * allowed except in the case of localhost (which enables development and
 * testing workflows).  Insecure URLs are allowed in dev mode.
 */
handle('openExternal', async (href) => {
  const isSecure = href.startsWith('https://');
  const isLocalhost =
    href.startsWith('http://localhost') || href.startsWith('http://127.0.0.1');
  if (isSecure || isLocalhost || isDev) {
    /**
     * Launch browser to display documentation and to support arbitrary OIDC flows
     * using openExternal. The protocol is validated (see above).
     */
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
  sessionManager.start(runtimeSettings.clusterUrl, target_id, token, host_id)
);

/**
 * Cancel an established boundary session spawned process.
 */
handle('stop', ({ session_id }) => sessionManager.stopById(session_id));

/**
 * Check for OS window chrome. Enabled on MacOS only.
 * Window chrome is disabled regardless of platform for
 * `DISABLE_WINDOW_CHROME=true`.
 */
handle('hasMacOSChrome', () =>
  process.env.DISABLE_WINDOW_CHROME ? false : isMac()
);

/**
 * Show window actions for non-MacOS platforms.
 * Window actions are disabled regardless of platform for
 * `DISABLE_WINDOW_CHROME=true`.
 */
handle('showWindowActions', () =>
  process.env.DISABLE_WINDOW_CHROME ? false : !isMac()
);

/**
 * Minimize window
 */
handle('minimizeWindow', () => BrowserWindow.getFocusedWindow().minimize());

/**
 * Toggle fullscreen window
 */
handle('toggleFullscreenWindow', () => {
  const window = BrowserWindow.getFocusedWindow();
  window.isMaximized() ? window.unmaximize() : window.maximize();
});

/**
 * Quit app
 */
handle('closeWindow', () => app.quit());
