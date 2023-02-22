/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const helpers = require('./test-helpers');

let electronApp = null;
// Subdirectory within tests/end2end/screenshots where the screenshots of this test suite will be stored.
const screenshotsDirectory = 'targets/';
// Path where the Boundary Desktop client binary is generated
const executablePath = helpers.returnExecutablePath(
  process.platform,
  process.arch
);

// Set login variables
const clusterUrlValue = 'http://localhost:9200';
const loginUsername = 'admin';
const loginPassword = 'password';

test.beforeEach(async () => {
  electronApp = await electron.launch({
    executablePath: executablePath,
    env: {
      NODE_ENV: 'test',
      BYPASS_APP_UPDATER: true,
    },
  });
});

test.afterEach(async () => {
  electronApp.close();
  electronApp = null; // Not sure we should do this.
});

test.describe('Targets end to end test suite', async () => {
  test('Connects to a target', async () => {
    const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.

    // Override local storage cluster URL
    await boundaryWindow.evaluate(() =>
      window.localStorage.setItem('desktop:clusterURL', null)
    );

    // Perform the login
    await helpers.login(
      boundaryWindow,
      clusterUrlValue,
      loginUsername,
      loginPassword
    );

    // Check we are in Targets
    await boundaryWindow.waitForURL('**/#/scopes/global/projects/targets');
    const windowUrl = new URL(await boundaryWindow.url());
    expect(windowUrl.hash).toEqual('#/scopes/global/projects/targets');

    // Click connect to a target
    await boundaryWindow.waitForSelector('table.rose-table');
    await helpers.click(
      boundaryWindow,
      'table.rose-table >> tbody >> tr >> nth=0 >> button >> text=Connect'
    );

    // The target popup opens
    await boundaryWindow.waitForSelector('section.dialog-detail');
    // Take screenshot
    await boundaryWindow.screenshot({
      path: helpers.generateScreenshotPath(
        screenshotsDirectory,
        'targetConnectionDetails'
      ),
      fullPage: true,
    });
    // Click copyable in popup
    // TODO: read clipboard value. Running into issues reading clipboard, so will take a shortcut for now
    await helpers.click(
      boundaryWindow,
      'section.dialog-detail >> div.rose-dialog-body >> button'
    );
    // Temporary: persist proxy from target
    const persistedProxy = await boundaryWindow.innerText(
      'section.dialog-detail >> div.rose-dialog-body >> span.copyable-content'
    );

    // Click close popup
    await helpers.click(
      boundaryWindow,
      'section.dialog-detail >> footer >> button'
    );

    // On left nav menu, click Sessions
    await boundaryWindow.waitForSelector('section.rose-layout-global >> aside');
    await helpers.click(
      boundaryWindow,
      'section.rose-layout-global >> aside >> nav >> a >> text=Sessions'
    );

    // Take screenshot
    await boundaryWindow.screenshot({
      path: helpers.generateScreenshotPath(screenshotsDirectory, 'sessions'),
      fullPage: true,
    });

    // Check the right session has status pending.
    await boundaryWindow.waitForSelector(
      'main >> div.rose-layout-page-body >> table.rose-table'
    );
    // Select Proxy
    const currentProxy = await boundaryWindow.innerText(
      'div.rose-layout-page-body >> table >> tbody >> tr >> nth=0 >> td >> nth=1 >> .copyable-content'
    );
    const currentStatus = await boundaryWindow.innerText(
      'div.rose-layout-page-body >> table >> tbody >> tr >> nth=0 >> td >> nth=3 >> .hds-badge'
    );

    expect(await persistedProxy).toEqual(await currentProxy);
    expect(await currentStatus).toEqual('pending');
    // TODO: before closing the app we should terminate sessions.
    // TODO: add test to check if sessions are not terminated we promp the confirmation dialog
  });
});
