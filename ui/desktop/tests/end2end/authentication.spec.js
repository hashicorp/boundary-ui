/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const helpers = require('./test-helpers');

let electronApp = null;
// Subdirectory within tests/end2end/screenshots where the screenshots of this test suite will be stored.
const screenshotsDirectory = 'authentication/';
// Path where the Boundary Desktop client binary is generated
const executablePath = helpers.returnExecutablePath(
  process.platform,
  process.arch
);

// Set login variables
const originValue = 'http://localhost:9200';
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

test.describe('Authentication end to end test suite', async () => {
  test.describe('user/password authentication test suite', async () => {
    test('Authenticates using user and password method and deauthenticates ', async () => {
      const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.

      // Override local storage origin
      await boundaryWindow.evaluate(() =>
        window.localStorage.setItem('desktop:origin', null)
      );

      // Perform login
      await helpers.login(
        boundaryWindow,
        originValue,
        loginUsername,
        loginPassword
      );

      // Take screenshot
      await boundaryWindow.screenshot({
        path: helpers.generateScreenshotPath(
          screenshotsDirectory,
          'fillUserPassword'
        ),
        fullPage: true,
      });

      // Click submit
      await boundaryWindow.waitForSelector('button[type="submit"]');
      await helpers.click(boundaryWindow, 'button[type="submit"]');

      // Check we are in Targets
      await boundaryWindow.waitForURL('**/#/scopes/global/projects/targets');
      const windowUrl = new URL(await boundaryWindow.url());
      expect(windowUrl.hash).toEqual('#/scopes/global/projects/targets');

      // Take screenshot
      await boundaryWindow.screenshot({
        path: helpers.generateScreenshotPath(
          screenshotsDirectory,
          'afterLogin'
        ),
        fullPage: true,
      });

      // Opens user dropdown
      await boundaryWindow.waitForSelector('.rose-header-utilities');
      await helpers.click(boundaryWindow, '.rose-header-utilities summary');

      // User dropdown is visible
      await boundaryWindow.waitForSelector('details[open]');
      expect(await boundaryWindow.isVisible('details'));
      // Take screenshot
      await boundaryWindow.screenshot({
        path: helpers.generateScreenshotPath(
          screenshotsDirectory,
          'userDropdown'
        ),
        fullPage: true,
      });

      // Clicks Deauthenticate
      await boundaryWindow.waitForSelector('text="Deauthenticate"');
      await helpers.click(boundaryWindow, 'text="Deauthenticate"');

      // Makes sure we are log out
      await boundaryWindow.waitForSelector('main >> div.branded-card');
      expect(await boundaryWindow.isVisible('h2 >> text=Authenticate'));
      // TODO: create an assertion checking localstorage ember_simple_auth-session key
      // TODO: try to check we are log out by url

      // Take screenshot
      await boundaryWindow.screenshot({
        path: helpers.generateScreenshotPath(
          screenshotsDirectory,
          'afterLogout'
        ),
        fullPage: true,
      });
    });

    test('Authenticates using user and wrong password, it can not authenticate', async () => {
      const boundaryWindow = await electronApp.firstWindow(); // The window that contains the app.
      // Override local storage origin
      await boundaryWindow.evaluate(() =>
        window.localStorage.setItem('desktop:origin', null)
      );
      // Perform login
      await helpers.login(
        boundaryWindow,
        originValue,
        loginUsername,
        '123456789'
      );

      // Wait for the notification
      await boundaryWindow.waitForSelector('.rose-notification-body');
      // Expect the notification to alert authentication has failed.
      expect(
        await boundaryWindow.innerText('div.rose-notification-body')
      ).toEqual('Authentication Failed');

      // Take screenshot
      await boundaryWindow.screenshot({
        path: helpers.generateScreenshotPath(
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
      await helpers.click(boundaryWindow, 'button[type="submit"]');

      // Click tab OIDC
      await boundaryWindow.waitForSelector('main >> div.branded-card >> nav');
      await helpers.click(boundaryWindow, 'a:text("OIDC")');

      await boundaryWindow.pause();
    });
  });
});
