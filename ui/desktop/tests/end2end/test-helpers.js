/* eslint-disable no-undef */
const path = require('path');

/**
 *
 * @param {string} screenshotTestDirectory screenshot directory for the specific test suite
 * @param {string} fileName The file name.
 * @returns A full path where to save the screenshot.
 */
exports.generateScreenshotPath = (screenshotTestDirectory, fileName) => {
  const screenshotFormat = '.png';
  const screenshotsRootPath = path.join(__dirname, 'screenshots');
  const screenshotPath = path.join(
    screenshotsRootPath,
    screenshotTestDirectory
  );
  return path.join(screenshotPath, fileName).concat(screenshotFormat);
};

/**
 *
 * @param {string} platform The operating system.
 * @param {string} arch The CPU architecture.
 * @returns A full path where the Desktop Client executable is located.
 */
exports.returnExecutablePath = (platform, arch) => {
  try {
    switch (platform) {
      case 'darwin':
        switch (arch) {
          case 'x64': // Intel chips
            return 'electron-app/out/Boundary-darwin-x64/Boundary.app/Contents/MacOS/Boundary';
          case 'arm64': // M1 chips
            return 'electron-app/out/Boundary-darwin-arm64/Boundary.app/Contents/MacOS/Boundary';
          default:
            throw new Error('The test suite is not compatible with your arch.');
        }
      default:
        throw new Error('The test suite is not compatible with your platform.');
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * Performs a click with a workarouind due to an error with plain playwright click.
 * More info about the issue here: https://github.com/microsoft/playwright/issues/1808
 * @param {object} appWindow The electron window to perform the action.
 * @param {string} selector The DOM element selector.
 */
exports.click = async (appWindow, selector) => {
  await appWindow.$eval(selector, (element) => element.click());
};

/**
 * Performs login on the app window provided with the credentials provided.
 * @param {object} appWindow The electron window to perform the action.
 * @param {string} origin URL origin to set.
 * @param {string} username Username to login.
 * @param {string} password Password to login.
 */
exports.login = async (appWindow, origin, username, password) => {
  // Fill the origin input
  await appWindow.waitForSelector('[name=host]');
  await appWindow.fill('[name=host]', origin);

  // Click the set origin submit button
  await appWindow.waitForSelector('button[type="submit"]');
  await this.click(appWindow, 'button[type="submit"]');

  // Fill user & password
  await appWindow.fill('[name="identification"]', username);
  await appWindow.fill('[name="password"]', password);

  // Click submit
  await appWindow.waitForSelector('button[type="submit"]');
  await this.click(appWindow, 'button[type="submit"]');
};
