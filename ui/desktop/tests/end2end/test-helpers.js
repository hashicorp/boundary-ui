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
 * @param {*} appWindow The current electron window.
 * @param {*} selector The DOM element selector.
 */
exports.click = async (appWindow, selector) => {
  await appWindow.$eval(selector, (element) => element.click());
};
