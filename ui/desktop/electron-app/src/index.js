/* eslint-disable no-console */
const path = require('path');
const {
  default: installExtension,
  EMBER_INSPECTOR,
} = require('electron-devtools-installer');
const { session, app, protocol, BrowserWindow, ipcMain } = require('electron');
require('./handlers.js');

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

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  // Register custom protocol
  const partition = emberAppName;
  const ses = session.fromPartition(partition);

  ses.protocol.registerFileProtocol(emberAppProtocol, (request, callback) => {
    const isDir = request.url.endsWith('/');
    const absolutePath = request.url.substr(emberAppURL.length);
    const normalizedPath = isDir
      ? path.normalize(`${emberAppDir}/index.html`)
      : path.normalize(`${emberAppDir}${absolutePath}`);

    if (isDev) console.log('[serving]', request.url);

    callback({ path: normalizedPath });
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

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      partition,
      sandbox: true,
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      preload: preloadPath,
    },
  });

  // If you want to open up dev tools programmatically, call
  // mainWindow.openDevTools();

  // Load the ember application
  mainWindow.loadURL(emberAppURL);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(emberAppURL);
  });

  mainWindow.webContents.on('crashed', () => {
    console.log(
      'Your Ember app (or other code) in the main window has crashed.'
    );
    console.log(
      'This is a serious issue that needs to be handled and/or debugged.'
    );
  });

  mainWindow.on('unresponsive', () => {
    console.log(
      'Your Ember app (or other code) has made the window unresponsive.'
    );
  });

  mainWindow.on('responsive', () => {
    console.log('The main window has become responsive again.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
