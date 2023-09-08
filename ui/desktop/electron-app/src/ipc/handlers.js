/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { app, shell, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const handle = require('./ipc-handler.js');
const boundaryCli = require('../cli/index.js');
const sessionManager = require('../services/session-manager.js');
const runtimeSettings = require('../services/runtime-settings.js');
const sanitizer = require('../utils/sanitizer.js');
const { isMac } = require('../helpers/platform.js');
const os = require('node:os');
const pty = require('node-pty');

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

/**
 * Handler to help create terminal windows. We don't use the helper `handle` method
 * as we need access to the event and don't need to be using `ipcMain.handle`.
 */
ipcMain.on('createTerminal', (event, payload) => {
  const { id, cols, rows } = payload;
  const { sender } = event;
  const terminalShell =
    os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
  const ptyProcess = pty.spawn(terminalShell, [], {
    name: 'xterm-color',
    cols,
    rows,
    cwd: process.env.HOME,
    env: process.env,
  });
  const incomingDataChannel = `terminalIncomingData-${id}`;
  const keystrokeChannel = `terminalKeystroke-${id}`;
  const resizeChannel = `resize-${id}`;
  const removeChannel = `removeTerminal-${id}`;

  // This sends to the renderer and xterm whatever the ptyProcess (host terminal) outputs.
  ptyProcess.on('data', function (data) {
    sender.send(incomingDataChannel, data);
  });

  // This writes into ptyProcess (host terminal) whatever we write through xterm.
  ipcMain.on(keystrokeChannel, (event, value) => {
    ptyProcess.write(value);
  });

  // Resize the number of columns and rows received from xterm.
  ipcMain.on(resizeChannel, (event, { cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  // We use `ipcMain.once` as we want this listener cleaned up
  // after killing the ptyProcess as well.
  ipcMain.once(removeChannel, () => {
    // Just let the error bubble up since we can't do anything
    try {
      ptyProcess.kill();
    } finally {
      // Remove listeners
      ipcMain.removeAllListeners(keystrokeChannel);
      ipcMain.removeAllListeners(resizeChannel);
    }
  });
});
