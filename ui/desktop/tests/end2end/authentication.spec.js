/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const {
  generateScreenshotPath,
  returnExecutablePath,
  customClick,
} = require('./test-helpers');

let electronApp = null;
const screenshotsDirectory = 'authentication/';
const executablePath = returnExecutablePath(process.platform, process.arch);

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

test.describe('Authentication end to end test suite', async () => {
  test.describe('user/password authentication test suite', async () => {
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
      await boundaryWindow.waitForSelector('[name=host]');
      await boundaryWindow.fill('[name=host]', originValue);
      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'fillOrigin'),
        fullPage: true,
      });

      // Click the submit button
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await customClick(boundaryWindow, 'button[type="submit"]');

      // Fill user & password
      await boundaryWindow.fill('[name="identification"]', authLoginNameValue);
      await boundaryWindow.fill('[name="password"]', authLoginPasswordValue);
      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'fillUserPassword'),
        fullPage: true,
      });

      // Click submit
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await customClick(boundaryWindow, 'button[type="submit"]');

      // Check we are in Targets
      await boundaryWindow.waitForURL('**/#/scopes/global/projects/targets');
      const windowUrl = new URL(await boundaryWindow.url());
      expect(windowUrl.hash).toEqual('#/scopes/global/projects/targets');

      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'afterLogin'),
        fullPage: true,
      });

      // Opens user dropdown
      await boundaryWindow.waitForSelector('.rose-header-utilities');
      await customClick(boundaryWindow, '.rose-header-utilities summary');

      // User dropdown is visible
      await boundaryWindow.waitForSelector('details[open]');
      expect(await boundaryWindow.isVisible('details'));
      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'userDropdown'),
        fullPage: true,
      });

      // Clicks Deauthenticate
      await boundaryWindow.waitForSelector('text="Deauthenticate"');
      await customClick(boundaryWindow, 'text="Deauthenticate"');

      // Makes sure we are log out
      await boundaryWindow.waitForSelector('main >> div.branded-card');
      expect(await boundaryWindow.isVisible('h2 >> text=Authenticate'));
      // TODO: create an assertion checking localstorage ember_simple_auth-session key
      // TODO: try to check we are log out by url

      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'afterLogout'),
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
      await boundaryWindow.fill('[name=host]', originValue);
      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(screenshotsDirectory, 'fillOrigin'),
        fullPage: true,
      });

      // Click the submit button
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await customClick(boundaryWindow, 'button[type="submit"]');

      // Fill user & password
      await boundaryWindow.fill('[name="identification"]', authLoginNameValue);
      await boundaryWindow.fill('[name="password"]', authLoginPasswordValue);

      // Click submit
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await customClick(boundaryWindow, 'button[type="submit"]');

      // Wait for the notification
      await boundaryWindow.waitForSelector('.rose-notification-body');
      // Expect the notification to alert authentication has failed.
      expect(
        await boundaryWindow.innerText('div.rose-notification-body')
      ).toEqual('Authentication Failed');

      // Take screenshot
      await boundaryWindow.screenshot({
        path: generateScreenshotPath(
          screenshotsDirectory,
          'notificationFailed'
        ),
        fullPage: true,
      });
    });
  });

  test.describe('OIDC authentication test suite', async () => {
    test.skip('OIDC', async () => {
      const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.

      // For some reason it catches a new window opens, but it closes the window right away.
      await electronApp.on('window', async (page) => {
        console.log('A new window is opening');
        // Catch if it closes
        await page.on('close', () => {
          console.log('is closing');
        });
      });

      // Override local storage origin
      await boundaryWindow.evaluate(() =>
        window.localStorage.setItem('desktop:origin', null)
      );
      const originValue = 'http://localhost:9200';

      // Fill the origin input
      await boundaryWindow.waitForSelector('[name=host]');
      await boundaryWindow.fill('[name=host]', originValue);

      // Click the submit button
      // Due to an error with await boundaryWindow.click('button[type="submit"]'); we are using a workaround.
      // More info about it here: https://github.com/microsoft/playwright/issues/1808
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await customClick(boundaryWindow, 'button[type="submit"]');

      // Click tab OIDC
      await boundaryWindow.waitForSelector('main >> div.branded-card >> nav');
      await customClick(boundaryWindow, 'a:text("OIDC")');

      await boundaryWindow.pause();
    });
  });
});
