/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');

let electronApp = null;
const returnScreenshotPath = (fileName) => {
  const screenshotPath = 'tests/end2end/screenshots/authentication/';
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

test.describe('Authentication end to end test suite', async () => {
  test('Authenticates using user and password method and deauthenticates ', async () => {
    const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.
    // Override local storage origin
    await boundaryWindow.evaluate(() =>
      window.localStorage.setItem('desktop:origin', null)
    );
    const originValue = 'http://localhost:9200';
    const authLoginNameValue = 'admin';
    const authLoginPasswordValue = 'password';

    // Fill the origin input
    await boundaryWindow.fill('.ember-text-field', originValue);
    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('fillOrigin'),
      fullPage: true,
    });

    // Click the submit button
    // Due to an error with await boundaryWindow.click('button[type="submit"]'); we are using a workaround.
    // More info about it here: https://github.com/microsoft/playwright/issues/1808
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );
    // Fill user & password
    await boundaryWindow.fill('[name="identification"]', authLoginNameValue);
    await boundaryWindow.fill('[name="password"]', authLoginPasswordValue);
    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('fillUserPassword'),
      fullPage: true,
    });

    // Click submit
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );
    await boundaryWindow.waitForSelector('h2 >> text=Targets');

    expect(await boundaryWindow.innerText('h2 >> text=Targets')).toEqual(
      'Targets '
    );
    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('afterLogin'),
      fullPage: true,
    });

    // Opens user dropdown
    await boundaryWindow.waitForSelector('.rose-header-utilities');
    await boundaryWindow.$eval('.rose-header-utilities summary', (element) =>
      element.click()
    );

    await boundaryWindow.waitForSelector('details[open]');
    // User dropdown is visible
    expect(await boundaryWindow.isVisible('details'));
    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('userDropdown'),
      fullPage: true,
    });

    // Clicks Deauthenticate
    await boundaryWindow.$eval('text="Deauthenticate"', (element) =>
      element.click()
    );

    await boundaryWindow.waitForSelector('main >> div.branded-card');
    // Makes sure we are log out
    expect(await boundaryWindow.isVisible('h2 >> text=Authenticate'));
    // ToDo: create an assertion checking localstorage ember_simple_auth-session key

    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('afterLogout'),
      fullPage: true,
    });
  });

  test('Authenticates using user and wrong password, it can not authenticate', async () => {
    const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.
    // Override local storage origin
    await boundaryWindow.evaluate(() =>
      window.localStorage.setItem('desktop:origin', null)
    );
    const originValue = 'http://localhost:9200';
    const authLoginNameValue = 'admin';
    const authLoginPasswordValue = '123456';

    // Fill the origin input
    await boundaryWindow.fill('.ember-text-field', originValue);
    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('fillOrigin'),
      fullPage: true,
    });

    // Click the submit button
    // Due to an error with await boundaryWindow.click('button[type="submit"]'); we are using a workaround.
    // More info about it here: https://github.com/microsoft/playwright/issues/1808
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );
    // Fill user & password
    await boundaryWindow.fill('[name="identification"]', authLoginNameValue);
    await boundaryWindow.fill('[name="password"]', authLoginPasswordValue);

    // Click submit
    await boundaryWindow.$eval('button[type="submit"]', (element) =>
      element.click()
    );

    // Wait for the notification
    await boundaryWindow.waitForSelector('.rose-notification-body');
    // Expect the notification to alert authentication has failed.
    expect(
      await boundaryWindow.innerText('div.rose-notification-body')
    ).toEqual('Authentication Failed');

    // Take screenshot
    await boundaryWindow.screenshot({
      path: returnScreenshotPath('notificationFailed'),
      fullPage: true,
    });
  });
});
