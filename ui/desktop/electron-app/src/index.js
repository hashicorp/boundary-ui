/* eslint-disable no-console */
const path = require('path');
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

const runtimeSettings = require('./services/runtime-settings.js');
const { generateCSPHeader } = require('./config/content-security-policy.js');
const sessionManager = require('./services/session-manager.js');

const menu = require('./config/menu.js');
const appUpdater = require('./helpers/app-updater.js');
const { isMac, isLinux } = require('./helpers/platform.js');
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

const createWindow = (partition, closeWindowCB) => {
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
      'icon.png'
    );

  const browserWindow = new BrowserWindow(browserWindowOptions);

  // If the user-specified origin changes, reload the page so that
  // the CSP can be refreshed with the this source allowed
  runtimeSettings.onOriginChange(() => browserWindow.loadURL(emberAppURL));

  // Load the ember application
  browserWindow.loadURL(emberAppURL);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  browserWindow.webContents.on('did-fail-load', () => {
    browserWindow.loadURL(emberAppURL);
  });

  browserWindow.webContents.on('crashed', () => {
    console.log(
      'Your Ember app (or other code) in the main window has crashed.'
    );
    console.log(
      'This is a serious issue that needs to be handled and/or debugged.'
    );
  });

  // Prevent navigation outside of serve://boundary per
  // Electronegativity LIMIT_NAVIGATION_GLOBAL_CHECK
  browserWindow.webContents.on('will-navigate', (event, url) => {
    /* eng-disable LIMIT_NAVIGATION_JS_CHECK */
    if (!url.startsWith('serve://boundary')) event.preventDefault();
  });

  // Opens external links in the host default browser.
  // We just allow boundaryproject.io domain to open on external window (for now).
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://boundaryproject.io/')) {
      shell.openExternal(url);
    }

    // Prevent opening of a browser window in electron
    return { action: 'deny' };
  });

  browserWindow.on('unresponsive', () => {
    console.log(
      'Your Ember app (or other code) has made the window unresponsive.'
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
  ses.protocol.registerFileProtocol(emberAppProtocol, (request, callback) => {
    /* eng-disable PROTOCOL_HANDLER_JS_CHECK */
    const isDir = request.url.endsWith('/');
    const absolutePath = request.url.substr(emberAppURL.length);
    const normalizedPath = isDir
      ? path.normalize(`${emberAppDir}/index.html`)
      : path.normalize(`${emberAppDir}${absolutePath}`);

    if (isDev) console.log('[serving]', request.url);

    callback({ path: normalizedPath });
  });

  // Disallow all permissions requests,
  // per Electronegativity PERMISSION_REQUEST_HANDLER_GLOBAL_CHECK
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    /* eng-disable PERMISSION_REQUEST_HANDLER_JS_CHECK */
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

  if (isDev) {
    try {
      require('devtron').install();
    } catch (err) {
      console.log('Failed to install Devtron: ', err);
    }
    try {
      await installExtension(EMBER_INSPECTOR);
    } catch (err) {
      console.log('Failed to install Ember Inspector: ', err);
    }
  }

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

  mainWindow = createWindow(partition, closeWindowCB);

  // Check for updates on launch
  appUpdater.run({ suppressNoUpdatePrompt: true });

  /**
   * Need for Mac OS behaviour of closing the window but not the app.
   * This allows to reopen the window if the user clicks Boundary icon in the dock
   * while the app is not close.
   * More info: https://www.electronjs.org/docs/latest/tutorial/quick-start#open-a-window-if-none-are-open-macos
   */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow(partition, closeWindowCB);
    }
  });
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
    'This is a serious issue that needs to be handled and/or debugged.'
  );
  console.log(`Exception: ${err}`);
});
