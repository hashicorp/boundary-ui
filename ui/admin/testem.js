/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const COLOR_THEME = process.env.COLOR_THEME ?? 'light';

if (!['dark', 'light'].includes(COLOR_THEME)) {
  throw new Error(
    `Only values of "dark" and "light" are allowed for environment variable COLOR_THEME`,
  );
}

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome', 'Firefox'],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      all: [
        COLOR_THEME === 'dark'
          ? '--enable-features=WebContentsForceDark'
          : null,
        COLOR_THEME === 'dark' ? '--force-dark-mode' : '--force-light-mode',
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
        '--disable-gpu',
        //'--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
    Firefox: ['-headless', '--window-size=1440,900'],
  },
  parallel: process.env.EMBER_EXAM_SPLIT_COUNT || 1,
};
