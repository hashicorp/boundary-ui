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
