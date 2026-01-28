/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcRenderer, contextBridge } = require('electron');

// Messages must originate from this origin
const emberAppOrigin = window.location.origin;

const ALLOWED_METHODS = {
  // Cluster management
  getClusterUrl: true,
  setClusterUrl: true,
  resetClusterUrl: true,

  // Session management
  connect: true,
  stop: true,
  stopAll: true,
  hasRunningSessions: true,

  // Window management
  hasMacOSChrome: true,
  showWindowActions: true,
  minimizeWindow: true,
  toggleFullscreenWindow: true,
  closeWindow: true,
  focusWindow: true,

  // System checks
  cliExists: true,
  checkCommand: true,
  checkOS: true,

  // Daemon management
  addTokenToDaemons: true,
  searchCacheDaemon: true,
  isCacheDaemonRunning: true,
  cacheDaemonStatus: true,
  getClientAgentSessions: true,
  isClientAgentRunning: true,
  clientAgentStatus: true,
  pauseClientAgent: true,
  resumeClientAgent: true,

  // Version info
  getCliVersion: true,
  getDesktopVersion: true,

  // Settings
  getLogLevel: true,
  setLogLevel: true,
  getLogPath: true,

  // RDP client
  getRdpClients: true,
  getPreferredRdpClient: true,
  setPreferredRdpClient: true,
  launchRdpClient: true,

  // External links
  openExternal: true,

  // Terminal management
  setActiveTerminal: true,
};

/**
 * Exposing terminal creation to an isolated context (Ember)
 * More information about contextBridge https://www.electronjs.org/docs/latest/api/context-bridge
 * usage example: window.terminal.send(data);
 */
contextBridge.exposeInMainWorld('terminal', {
  // We could've sent data through our established postMessage pattern
  // but we don't need a response back so we can make it include it here
  // to make it simpler. This keeps sending and receiving handlers symmetrical.
  receive: (callback, id) => {
    const incomingDataChannel = `terminalIncomingData-${id}`;
    const listenerCallback = (_event, value) => callback(value);
    ipcRenderer.on(incomingDataChannel, listenerCallback);

    // Return a function for the caller to handle cleaning up the listener
    return () => {
      return ipcRenderer.removeListener(incomingDataChannel, listenerCallback);
    };
  },
  create: (vars) => {
    ipcRenderer.send('createTerminal', vars);
  },
  remove: (id) => {
    ipcRenderer.send(`removeTerminal-${id}`);
  },
  resize: (size, id) => {
    ipcRenderer.send(`resize-${id}`, size);
  },
});

process.once('loaded', () => {
  /**
   * Ember-land has no access to the renderer or node modules, and thus
   * cannot call into the main process or make invocations directly.
   * In order to communicate with the main process, the Ember app uses
   * the `postMessage` interface to send messages to its browser window.
   * These messages include message ports with which to receive responses from
   * the main process.
   *
   * This preload script simply wires up the forwarding of
   * messages received on the window and responses received from main.
   */
  window.addEventListener('message', async function (event) {
    if (event.origin !== emberAppOrigin) return;
    const { method, payload } = event?.data ?? {};

    // validate methods to avoid arbitrary IPC calls
    if (method && !ALLOWED_METHODS[method]) return;

    if (method) {
      const response = await ipcRenderer.invoke(method, payload);
      event.ports[0].postMessage(response);
    }
  });
});

/**
 * Listener on electron app when user triggers before-quit event
 */
contextBridge.exposeInMainWorld('electron', {
  onAppQuit: (callback) => {
    // Don't pass in callback directly so users can't access passed in event for security
    const listenerCallback = () => callback();
    ipcRenderer.on('onAppQuit', listenerCallback);

    return () => {
      return ipcRenderer.removeListener('onAppQuit', listenerCallback);
    };
  },
});
