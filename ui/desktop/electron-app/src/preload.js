/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcRenderer, contextBridge, webFrame } = require('electron');

/**
 * Helper function to invoke IPC calls to properly handle errors
 */
async function invoke(method, payload) {
  const { error, result } = await ipcRenderer.invoke(method, payload);
  if (error) {
    throw new Error(error.message);
  }
  return result;
}

/**
 * Exposes `desktop` via Electron ContextBridge to the renderer process. It is grouped into nested objects based on the type of functionality.
 * use example: window.desktop.cluster.getClusterUrl().
 */
contextBridge.exposeInMainWorld('desktop', {
  cluster: {
    getClusterUrl: () => invoke('getClusterUrl'),
    setClusterUrl: (url) => invoke('setClusterUrl', url),
    resetClusterUrl: () => invoke('resetClusterUrl'),
  },

  system: {
    openExternal: (href) => invoke('openExternal', href),
    cliExists: () => invoke('cliExists'),
    getCliVersion: () => invoke('getCliVersion'),
    checkCommand: (command) => invoke('checkCommand', command),
    checkOS: () => invoke('checkOS'),
    getDesktopVersion: () => invoke('getDesktopVersion'),
  },

  session: {
    connectSession: (params) => invoke('connect', params),
    stopSession: (params) => invoke('stop', params),
    stopAllSessions: () => invoke('stopAll'),
    hasRunningSessions: () => invoke('hasRunningSessions'),
  },

  windowAction: {
    hasMacOSChrome: () => invoke('hasMacOSChrome'),
    showWindowActions: () => invoke('showWindowActions'),
    minimizeWindow: () => invoke('minimizeWindow'),
    toggleFullscreenWindow: () => invoke('toggleFullscreenWindow'),
    closeWindow: () => invoke('closeWindow'),
    focusWindow: () => invoke('focusWindow'),
  },

  daemon: {
    addTokenToDaemons: (data) => invoke('addTokenToDaemons', data),
    searchCacheDaemon: (request) => invoke('searchCacheDaemon', request),
    isCacheDaemonRunning: () => invoke('isCacheDaemonRunning'),
    cacheDaemonStatus: () => invoke('cacheDaemonStatus'),
  },

  clientAgent: {
    getClientAgentSessions: () => invoke('getClientAgentSessions'),
    isClientAgentRunning: () => invoke('isClientAgentRunning'),
    clientAgentStatus: () => invoke('clientAgentStatus'),
    pauseClientAgent: () => invoke('pauseClientAgent'),
    resumeClientAgent: () => invoke('resumeClientAgent'),
  },

  logging: {
    getLogLevel: () => invoke('getLogLevel'),
    setLogLevel: (logLevel) => invoke('setLogLevel', logLevel),
    getLogPath: () => invoke('getLogPath'),
  },

  rdp: {
    getRdpClients: () => invoke('getRdpClients'),
    getPreferredRdpClient: () => invoke('getPreferredRdpClient'),
    setPreferredRdpClient: (client) => invoke('setPreferredRdpClient', client),
    launchRdpClient: (sessionId) => invoke('launchRdpClient', sessionId),
  },

  app: {
    onAppQuit: (callback) => {
      // Don't pass in callback directly so users can't access passed in event for security
      const listenerCallback = () => callback();
      ipcRenderer.on('onAppQuit', listenerCallback);

      return () => {
        return ipcRenderer.removeListener('onAppQuit', listenerCallback);
      };
    },
  },
});

contextBridge.exposeInMainWorld('webContentView', {
  createTerminalView: (params) => {
    ipcRenderer.send('createTerminalView', {
      ...params,
      zoomFactor: webFrame.getZoomFactor(),
    });
  },
  destroyTerminalView: () => {
    ipcRenderer.send('destroyTerminalView');
  },
  hideTerminalView: () => {
    ipcRenderer.send('hideTerminalView');
  },
  positionTerminalView: (position) => {
    ipcRenderer.send('positionTerminalView', {
      position,
      zoomFactor: webFrame.getZoomFactor(),
    });
  },
});
