/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcRenderer, contextBridge } = require('electron');

/**
 * Exposing terminal creation to an isolated context (Ember)
 * More information about contextBridge https://www.electronjs.org/docs/latest/api/context-bridge
 * usage example: window.terminal.send(data);
 */
contextBridge.exposeInMainWorld('terminal', {
  // We could've sent data through our established postMessage pattern
  // but we don't need a response back so we can make it include it here
  // to make it simpler. This keeps sending and receiving handlers symmetrical.
  send: (data, id) => {
    ipcRenderer.send(`terminalKeystroke-${id}`, data);
  },
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

/**
 * Expose a secure boundary API to the renderer using explicit methods.
 * This eliminates generic IPC invocation and follows Electron security best practices.
 * Each method is explicitly mapped to a specific IPC handler.
 * */
contextBridge.exposeInMainWorld('boundary', {
  // cluster
  getClusterUrl: () => ipcRenderer.invoke('getClusterUrl'),
  setClusterUrl: (url) => ipcRenderer.invoke('setClusterUrl', url),
  resetClusterUrl: () => ipcRenderer.invoke('resetClusterUrl'),

  openExternal: (href) => ipcRenderer.invoke('openExternal', href),
  cliExists: () => ipcRenderer.invoke('cliExists'),
  getCliVersion: () => ipcRenderer.invoke('getCliVersion'),
  checkCommand: (command) => ipcRenderer.invoke('checkCommand', command),
  checkOS: () => ipcRenderer.invoke('checkOS'),
  getDesktopVersion: () => ipcRenderer.invoke('getDesktopVersion'),

  // session
  connectSession: (params) => ipcRenderer.invoke('connect', params),
  stopSession: (params) => ipcRenderer.invoke('stop', params),
  stopAllSessions: () => ipcRenderer.invoke('stopAll'),
  hasRunningSessions: () => ipcRenderer.invoke('hasRunningSessions'),

  // window
  hasMacOSChrome: () => ipcRenderer.invoke('hasMacOSChrome'),
  showWindowActions: () => ipcRenderer.invoke('showWindowActions'),
  minimizeWindow: () => ipcRenderer.invoke('minimizeWindow'),
  toggleFullscreenWindow: () => ipcRenderer.invoke('toggleFullscreenWindow'),
  closeWindow: () => ipcRenderer.invoke('closeWindow'),
  focusWindow: () => ipcRenderer.invoke('focusWindow'),

  // daemon
  addTokenToDaemons: (data) => ipcRenderer.invoke('addTokenToDaemons', data),
  searchCacheDaemon: (request) =>
    ipcRenderer.invoke('searchCacheDaemon', request),
  isCacheDaemonRunning: () => ipcRenderer.invoke('isCacheDaemonRunning'),
  cacheDaemonStatus: () => ipcRenderer.invoke('cacheDaemonStatus'),

  // client agent
  getClientAgentSessions: () => ipcRenderer.invoke('getClientAgentSessions'),
  isClientAgentRunning: () => ipcRenderer.invoke('isClientAgentRunning'),
  clientAgentStatus: () => ipcRenderer.invoke('clientAgentStatus'),
  pauseClientAgent: () => ipcRenderer.invoke('pauseClientAgent'),
  resumeClientAgent: () => ipcRenderer.invoke('resumeClientAgent'),

  // logging
  getLogLevel: () => ipcRenderer.invoke('getLogLevel'),
  setLogLevel: (logLevel) => ipcRenderer.invoke('setLogLevel', logLevel),
  getLogPath: () => ipcRenderer.invoke('getLogPath'),

  // rdp
  getRdpClients: () => ipcRenderer.invoke('getRdpClients'),
  getPreferredRdpClient: () => ipcRenderer.invoke('getPreferredRdpClient'),
  setPreferredRdpClient: (client) =>
    ipcRenderer.invoke('setPreferredRdpClient', client),
  launchRdpClient: (sessionId) =>
    ipcRenderer.invoke('launchRdpClient', sessionId),
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
