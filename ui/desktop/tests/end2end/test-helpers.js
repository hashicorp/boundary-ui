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
<<<<<<< HEAD
  const screenshotsRootPath = path.join(__dirname, 'screenshots');
=======
  const screenshotsRootPath = path.join(__dirname, '/screenshots/');
>>>>>>> 8c489b81 (refactor: 💡 Create generateScreenshotPath as test helper)
  const screenshotPath = path.join(
    screenshotsRootPath,
    screenshotTestDirectory
  );
  return path.join(screenshotPath, fileName).concat(screenshotFormat);
};
