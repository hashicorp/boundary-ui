/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launchers: {
    Electron: require('ember-electron/lib/test-runner'),
  },
  launch_in_ci: ['Electron'],
  launch_in_dev: ['Electron'],
  browser_args: {
    Electron: {
      // Note: Some these Chrome options may not be supported in Electron
      // See https://electronjs.org/docs/api/chrome-command-line-switches
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        // Disable backgrounding renders for occluded windows
        '--disable-backgrounding-occluded-windows',
        // Disable renderer process backgrounding
        '--disable-renderer-backgrounding',
        // Disable task throttling of timer tasks from background pages
        '--disable-background-timer-throttling',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
  },
};
