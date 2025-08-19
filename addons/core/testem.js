/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';
const MultiReporter = require('testem-multi-reporter');
const JUnitReporter = require('testem-gitlab-reporter');
const fs = require('fs');

// eslint-disable-next-line n/no-extraneous-require, n/no-missing-require
const TAPReporter = require('testem/lib/reporters/tap_reporter');

const multiReporterConfig = {
  reporters: [
    {
      ReporterClass: TAPReporter,
      args: [false, null, { get: () => false }],
    },
  ],
};

if (process.env.CREATE_JUNIT_TEST_REPORT === 'true') {
  !fs.existsSync('./test-reports') && fs.mkdirSync('./test-reports');
  multiReporterConfig.reporters.push({
    ReporterClass: JUnitReporter,
    args: [
      false,
      fs.createWriteStream('test-reports/junit.xml'),
      { get: () => false },
    ],
  });
}

let reporter = new MultiReporter(multiReporterConfig);

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
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
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
  },
  reporter,
};
