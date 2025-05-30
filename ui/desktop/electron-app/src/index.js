/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-console */
const path = require('path');
const { net } = require('electron');
const {
  default: installExtension,
  EMBER_INSPECTOR,
} = require('electron-devtools-installer');
const {
  session,
  app,
  dialog,
  protocol,
  BrowserWindow,
  Menu,
  MenuItem,
  shell,
} = require('electron');
require('./ipc/handlers.js');
const log = require('electron-log/main');
const fs = require('fs');

const { generateCSPHeader } = require('./config/content-security-policy.js');
const runtimeSettings = require('./services/runtime-settings.js');
const sessionManager = require('./services/session-manager.js');
const cacheDaemonManager = require('./services/cache-daemon-manager');
const store = require('./services/electron-store-manager');

const menu = require('./config/menu.js');
const appUpdater = require('./helpers/app-updater.js');
const { isMac, isLinux, isWindows } = require('./helpers/platform.js');
const fixPath = require('./utils/fixPath');
const isLocalhost = require('./utils/isLocalhost');
const config = require('../config/config.js');
const { version } = require('./cli/index.js');
const isDev = require('electron-is-dev');

// Register the custom file protocol
const emberAppProtocol = 'serve';
const emberAppName = 'boundary';
const emberAppURL = `${emberAppProtocol}://${emberAppName}`;
const emberAppDir = path.resolve(__dirname, '..', 'ember-dist');
const preloadPath = path.resolve(__dirname, 'preload.js');

protocol.registerSchemesAsPrivileged([
  {
    scheme: emberAppProtocol,
    privileges: {
      secure: true,
      standard: true,
    },
  },
]);

// This is to correctly set the process.env.PATH as electron does not
// correctly inherit the path variable in production
fixPath();

// Setup logger
log.initialize();
log.transports.console.level = false;
log.transports.file.level = store.get('logLevel');
log.transports.file.format =
  '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}{z}] [{level}] {text}';
log.transports.file.fileName = 'desktop-client.log';
// Set the max file size to 10MB
log.transports.file.maxSize = 10485760;

// Immediately log the version information
log.info(
  `Boundary Desktop Client Version: ${config.releaseVersion} | Commit: ${config.releaseCommit}`,
);
const cliInfo = version();
log.info(
  `Boundary CLI Version: ${cliInfo.versionNumber} | Commit: ${cliInfo.gitRevision}`,
);

if (isWindows()) {
  // Set the app user model ID to the app name as it will display the ID
  // in any notifications on windows unless a squirrel installation is used.
  app.setAppUserModelId(app.name);
}

const createWindow = async (partition, closeWindowCB) => {
  /**
   * Enable electron OS window frame/chrome for MacOS only.
   * Disable frame/chrome regardless of OS when
   * `DISABLE_WINDOW_CHROME=true`.
   */
  let showWindowChrome = isMac();
  if (process.env.DISABLE_WINDOW_CHROME) showWindowChrome = false;

  const browserWindowOptions = {
    width: 1280,
    height: 760,
    minWidth: 812,
    minHeight: 400,
    frame: showWindowChrome,
    titleBarStyle: showWindowChrome ? 'hiddenInset' : 'none',
    webPreferences: {
      partition,
      sandbox: true,
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      allowRunningInsecureContent: false,
      // The preload script establishes the message-based IPC pathway without
      // exposing new modules to the renderer.
      preload: preloadPath /* eng-disable PRELOAD_JS_CHECK */,
      disableBlinkFeatures: 'Auxclick',
    },
  };

  // To show app icon in toolbar in linux, set browser window icon.
  // This is a limitation of electron build.
  if (isLinux())
    browserWindowOptions.icon = path.join(
      __dirname,
      '..',
      'assets',
      'app-icons',
      'icon.png',
    );

  const browserWindow = new BrowserWindow(browserWindowOptions);

  // If the user-specified cluster URL changes, reload the page so that
  // the CSP can be refreshed with the this source allowed
  runtimeSettings.onClusterUrlChange(
    async () => await browserWindow.loadURL(emberAppURL),
  );

  // Load the ember application
  await browserWindow.loadURL(emberAppURL);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  browserWindow.webContents.on('did-fail-load', async () => {
    await browserWindow.loadURL(emberAppURL);
  });

  browserWindow.webContents.on('render-process-gone', () => {
    console.log(
      'Your Ember app (or other code) in the main window has crashed.',
    );
    console.log(
      'This is a serious issue that needs to be handled and/or debugged.',
    );
  });

  // Prevent navigation outside of serve://boundary per
  // Electronegativity LIMIT_NAVIGATION_GLOBAL_CHECK
  browserWindow.webContents.on('will-navigate', (event, url) => {
    /* eng-disable LIMIT_NAVIGATION_JS_CHECK */
    if (!url.startsWith('serve://boundary')) event.preventDefault();
  });

  // Opens external links in the host default browser.
  // We allow developer.hashicorp.com domain to open on external window
  // and releases.hashicorp.com domain to download the desktop app or
  // link to the release page for the desktop app.
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      isLocalhost(url) ||
      url.startsWith('https://developer.hashicorp.com/') ||
      url.startsWith('https://releases.hashicorp.com/boundary-desktop/') ||
      url.startsWith('https://support.hashicorp.com/hc/en-us')
    ) {
      shell.openExternal(url);
    }

    // Prevent opening of a browser window in electron
    return { action: 'deny' };
  });

  browserWindow.on('unresponsive', () => {
    console.log(
      'Your Ember app (or other code) has made the window unresponsive.',
    );
  });

  browserWindow.on('responsive', () => {
    console.log('The main window has become responsive again.');
  });

  browserWindow.on('closed', () => {
    closeWindowCB();
  });

  return browserWindow;
};

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  // Setup a partition
  // Must be prefixed with persist: in order to save things like localStorage
  // data.  Without this, the session is in-memory only.
  // https://www.electronjs.org/docs/api/session#sessionfrompartitionpartition-options
  const partition = `persist:${emberAppName}`;
  const ses = session.fromPartition(partition);

  // Register custom protocol
  // This file protocol is the exclusive protocol for this application.  All
  // other protocols are disabled.
  ses.protocol.handle(emberAppProtocol, (request) => {
    /* eng-disable PROTOCOL_HANDLER_JS_CHECK */
    const isDir = request.url.endsWith('/');
    const absolutePath = request.url.substring(emberAppURL.length);
    const normalizedPath = isDir
      ? path.normalize(`${emberAppDir}/index.html`)
      : path.normalize(`${emberAppDir}${absolutePath}`);

    if (isDev) console.log('[serving]', request.url);
    return net.fetch(`file://${normalizedPath}`);
  });

  // Disallow all permissions requests,
  // per Electronegativity PERMISSION_REQUEST_HANDLER_GLOBAL_CHECK
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    // We need to allow this for native clipboard usage
    if (
      permission === 'clipboard-sanitized-write' ||
      permission === 'notifications'
    ) {
      // Approves the permissions request
      return callback(true);
    }
    return callback(false);
  });

  // Setup content security policy
  ses.webRequest.onHeadersReceived((details, callback) => {
    callback({
      // See `content-security-policy.js` to learn how the CSP is generated.
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [generateCSPHeader()],
      },
    });
  });

  // Configure dev tools menu
  const menuTemplate = Menu.buildFromTemplate(menu.generateMenuTemplate());
  if (isDev) {
    const view = menuTemplate.getMenuItemById('view');
    view.submenu.append(new MenuItem({ role: 'toggleDevTools' }));
  }
  Menu.setApplicationMenu(menuTemplate);

  // Close window callback
  const closeWindowCB = () => {
    mainWindow = null;
  };

  mainWindow = await createWindow(partition, closeWindowCB);

  // Check for updates on launch
  appUpdater.run({ suppressNoUpdatePrompt: true });

  /**
   * Need for Mac OS behavior of closing the window but not the app.
   * This allows to reopen the window if the user clicks Boundary icon in the dock
   * while the app is not close.
   * More info: https://www.electronjs.org/docs/latest/tutorial/quick-start#open-a-window-if-none-are-open-macos
   */
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createWindow(partition, closeWindowCB);
    }
  });

  await cacheDaemonManager.start();
});

/**
 * Prompt for closing spawned processes
 */
app.on('before-quit', (event) => {
  if (sessionManager.hasRunningSessions) {
    const dialogOpts = {
      type: 'question',
      buttons: ['Close', 'Cancel'],
      detail: 'Close sessions before quitting?',
    };

    const buttonId = dialog.showMessageBoxSync(null, dialogOpts);
    buttonId === 0 ? sessionManager.stopAll() : event.preventDefault();
  }
});

app.on('quit', () => {
  cacheDaemonManager.stop();
});

// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
  console.log('An exception in the main thread was not handled.');
  console.log(
    'This is a serious issue that needs to be handled and/or debugged.',
  );
  console.log(`Exception: ${err}`);
});
