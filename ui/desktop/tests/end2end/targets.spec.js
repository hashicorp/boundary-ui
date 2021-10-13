/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');

let electronApp = null;
const generateScreenshotPath = (fileName) => {
  const screenshotPath = 'tests/end2end/screenshots/targets/';
  const screenshotFormat = '.png';
  return path.join(screenshotPath, fileName).concat(screenshotFormat);
};

test.beforeEach(async () => {
  electronApp = await electron.launch({
    executablePath:
      'electron-app/out/Boundary-darwin-arm64/Boundary.app/Contents/MacOS/Boundary',
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
    // Override local storage origin
    await boundaryWindow.evaluate(() =>
      window.localStorage.setItem('desktop:origin', null)
    );

    const originValue = 'http://localhost:9200';
    const authLoginNameValue = 'admin';
    const authLoginPasswordValue = 'password';

    // Fill the origin input
    await boundaryWindow.waitForSelector('.ember-text-field');
    await boundaryWindow.fill('.ember-text-field', originValue);

    // Click the submit button
    // Due to an error with await boundaryWindow.click('button[type="submit"]'); we are using a workaround.
    // More info about it here: https://github.com/microsoft/playwright/issues/1808
    await boundaryWindow.waitForSelector('button[type="submit"]');
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );
    // Fill user & password
    await boundaryWindow.fill('[name="identification"]', authLoginNameValue);
    await boundaryWindow.fill('[name="password"]', authLoginPasswordValue);

    // Click submit
    await boundaryWindow.waitForSelector('button[type="submit"]');
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );
    // Check we are in Targets
    await boundaryWindow.waitForSelector('h2 >> text=Targets');
    expect(await boundaryWindow.innerText('h2 >> text=Targets')).toEqual(
      'Targets '
    );

    // Click connect to a target
    await boundaryWindow.waitForSelector('table.rose-table');
    await boundaryWindow.$eval(
      'table.rose-table >> tbody >> tr >> nth=0 >> button >> text=Connect',
      (element) => element.click()
    );

    // The target popup opens
    await boundaryWindow.waitForSelector('section.dialog-detail');
    // Take screenshot
    await boundaryWindow.screenshot({
      path: generateScreenshotPath('targetConnectionDetails'),
      fullPage: true,
    });
    // Click copyable in popup
    // TODO: read clipboard value. Running into issues reading clipboard, so will take a shortcut for now
    await boundaryWindow.$eval(
      'section.dialog-detail >> div.rose-dialog-body >> button',
      (element) => element.click()
    );
    // Temporary: persist proxy from target
    const persistedProxy = await boundaryWindow.innerText(
      'section.dialog-detail >> div.rose-dialog-body >> span.copyable-content'
    );

    // Click close popup
    await boundaryWindow.$eval(
      'section.dialog-detail >> footer >> button',
      (element) => element.click()
    );

    // On left nav menu, click Sessions
    await boundaryWindow.waitForSelector('section.rose-layout-global >> aside');
    await boundaryWindow.$eval(
      'section.rose-layout-global >> aside >> nav >> a >> text=Sessions',
      (element) => element.click()
    );

    // Take screenshot
    await boundaryWindow.screenshot({
      path: generateScreenshotPath('sessions'),
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
      'div.rose-layout-page-body >> table >> tbody >> tr >> nth=0 >> td >> nth=3 >> .rose-badge-body'
    );

    expect(await persistedProxy).toEqual(await currentProxy);
    expect(await currentStatus).toEqual('pending');
    // TODO: before closing the app we should terminate sessions.
    // TODO: add test to check if sessions are not terminated we promp the confirmation dialog
  });
});
