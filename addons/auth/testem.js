/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome', 'Firefox'],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
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
        '--disable-gpu',
        //'--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
    Firefox: ['-headless', '--window-size=1440,900'],
  },
};
