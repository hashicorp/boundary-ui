/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { app, shell, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const handle = require('./ipc-handler.js');
const boundaryCli = require('../cli/index.js');
const sessionManager = require('../services/session-manager.js');
const runtimeSettings = require('../services/runtime-settings.js');
const sanitizer = require('../utils/sanitizer.js');
const isLocalhost = require('../utils/isLocalhost');
const { isLinux, isMac, isWindows } = require('../helpers/platform.js');
const os = require('node:os');
const pty = require('node-pty');
const which = require('which');
const cacheDaemonManager = require('../services/cache-daemon-manager');
const clientAgentDaemonManager = require('../services/client-agent-daemon-manager');
const { releaseVersion } = require('../../config/config.js');
const store = require('../services/electron-store-manager');
const rdpClientManager = require('../services/rdp-client-manager');

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
  await runtimeSettings.setClusterUrl(clusterUrl);
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

  if (isSecure || isLocalhost(href) || isDev) {
    /**
     * Launch browser to display documentation and to support arbitrary OIDC flows
     * using openExternal. The protocol is validated (see above).
     */
    shell.openExternal(href); /* eng-disable OPEN_EXTERNAL_JS_CHECK */
  } else {
    throw new Error(
      `URLs may only be opened over HTTPS in an external browser.
       The URL '${href}' could not be opened.`,
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
handle('connect', ({ target_id, token, host_id, session_max_seconds }) =>
  sessionManager.start(
    runtimeSettings.clusterUrl,
    target_id,
    token,
    host_id,
    session_max_seconds,
  ),
);

/**
 * Stop an established boundary session spawned process.
 */
handle('stop', ({ session_id }) => sessionManager.stopById(session_id));

/**
 * Stop all active and pending target sessions and rdp processes.
 */
handle('stopAll', async () => {
  await sessionManager.stopAll();
  rdpClientManager.stopAll();
});

/**
 * Check for OS window chrome. Enabled on MacOS only.
 * Window chrome is disabled regardless of platform for
 * `DISABLE_WINDOW_CHROME=true`.
 */
handle('hasMacOSChrome', () =>
  process.env.DISABLE_WINDOW_CHROME ? false : isMac(),
);

/**
 * Show window actions for non-MacOS platforms.
 * Window actions are disabled regardless of platform for
 * `DISABLE_WINDOW_CHROME=true`.
 */
handle('showWindowActions', () =>
  process.env.DISABLE_WINDOW_CHROME ? false : !isMac(),
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
 * Check if session manager has running sessions
 * Return boolean
 */
handle('hasRunningSessions', () => sessionManager.hasRunningSessions);

/**
 * Focus the window
 */
handle('focusWindow', () => {
  // On windows, `Browser.getFocusedWindow()` can return null depending on
  // the context so we just grab the first window from all windows. Because we
  // currently only ever have one window active, this should be the same window.
  const window = BrowserWindow.getAllWindows()[0];
  window.show();
});

/**
 * Return the location of where a user's binary for a command is. If it isn't found, return null.
 */
handle('checkCommand', async (command) => which(command, { nothrow: true }));

/**
 * Adds the user's token to the daemons.
 */
handle('addTokenToDaemons', async (data) => cacheDaemonManager.addToken(data));

/**
 * Return an object containing helper fields for determining what OS we're running on
 */
handle('checkOS', () => ({
  isLinux: isLinux(),
  isMac: isMac(),
  isWindows: isWindows(),
}));

/**
 * Call the cache daemon's search endpoint to retrieve cached results.
 */
handle('searchCacheDaemon', async (request) =>
  cacheDaemonManager.search(request),
);

/**
 * Check to see if the cache daemon is running. We use the presence of a
 * socket path as a proxy for whether the daemon is running.
 */
handle('isCacheDaemonRunning', async () => {
  try {
    await cacheDaemonManager.status();
  } catch (e) {
    // There was likely an error connecting to the cache daemon.
    return false;
  }
  return Boolean(cacheDaemonManager.socketPath);
});

/**
 * Gets the client agent's sessions
 */
handle('getClientAgentSessions', async () => {
  return clientAgentDaemonManager.getSessions();
});

/**
 * Check to see if the client agent daemon is running.
 */
handle('isClientAgentRunning', async () => {
  try {
    const status = await clientAgentDaemonManager.status();

    // Check if we got an error for connecting to a non-enterprise controller
    const isWrongControllerError = status.errors?.some((error) =>
      error.includes('controller is not an enterprise edition controller'),
    );
    if (isWrongControllerError) {
      return false;
    }

    return status.status === 'running';
  } catch (e) {
    // There was likely an error connecting to client agent.
    return false;
  }
});

/**
 * Returns the client agent's status
 */
handle('clientAgentStatus', async () => clientAgentDaemonManager.status());

/**
 * Pauses the client agent
 */
handle('pauseClientAgent', async () => clientAgentDaemonManager.pause());

/**
 * Resumes the client agent
 */
handle('resumeClientAgent', async () => clientAgentDaemonManager.resume());

/**
 * Gets boundary cli version
 */
handle('getCliVersion', async () => boundaryCli.version());

/**
 * Returns desktop version
 */
handle('getDesktopVersion', async () => ({ desktopVersion: releaseVersion }));

/**
 * Returns the Cache daemon status
 */
handle('cacheDaemonStatus', async () => cacheDaemonManager.status());

/**
 * Returns the current log level
 */
handle('getLogLevel', () => store.get('logLevel'));

/**
 * Sets the log level
 */
handle('setLogLevel', (logLevel) => store.set('logLevel', logLevel));

/**
 * Returns the path to the log file
 */
handle('getLogPath', () => {
  switch (os.platform()) {
    case 'win32':
      return `${
        process.env.USERPROFILE ?? '%USERPROFILE%'
      }\\AppData\\Roaming\\Boundary\\logs\\desktop-client.log`;
    case 'darwin':
      return '~/Library/Logs/Boundary/desktop-client.log';
    case 'linux':
      return '~/.config/Boundary/logs/desktop-client.log';
  }
});

/**
 * Returns the available RDP clients
 */
handle('getRdpClients', async () => rdpClientManager.getAvailableRdpClients());

/**
 * Returns the preferred RDP client
 */
handle('getPreferredRdpClient', async () =>
  rdpClientManager.getPreferredRdpClient(),
);

/**
 * Sets the preferred RDP client
 */
handle('setPreferredRdpClient', (preferredClient) =>
  rdpClientManager.setPreferredRdpClient(preferredClient),
);

/**
 * Launches the RDP client with the provided session ID.
 */
handle('launchRdpClient', async (sessionId) =>
  rdpClientManager.launchRdpClient(sessionId, sessionManager),
);

/**
 * Handler to help create terminal windows. We don't use the helper `handle` method
 * as we need access to the event and don't need to be using `ipcMain.handle`.
 */
ipcMain.on('createTerminal', (event, payload) => {
  const { id, cols, rows } = payload;
  const { sender } = event;
  const terminalShell = isWindows()
    ? 'powershell.exe'
    : process.env.SHELL || '/bin/bash';
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
      //  TODO: Should we be killing entire process tree in windows with its pid?
      ptyProcess.kill();
    } finally {
      // Remove listeners
      ipcMain.removeAllListeners(keystrokeChannel);
      ipcMain.removeAllListeners(resizeChannel);
    }
  });
});
