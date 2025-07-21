/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      all: [
        process.env.DARK_MODE ? '--enable-features=WebContentsForceDark' : null,
        process.env.DARK_MODE ? '--force-dark-mode' : null,
      ].filter(Boolean),
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
  parallel: process.env.EMBER_EXAM_SPLIT_COUNT || 1,
};
