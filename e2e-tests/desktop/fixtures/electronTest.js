/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Get the path to the Boundary Desktop executable
 * @param buildDirectory
 * @return {string}
 */
const getExecutablePath = (buildDirectory = 'out') => {
  // Using process.cwd() can change depending on where you run the tests so we use the current file location
  // __dirname isn't available in ES modules so we need to indirectly get the directory
  const rootDir = path.resolve(
    import.meta.dirname,
    '../../../ui/desktop/electron-app',
  );

  // directory where the builds are stored
  const outDir = path.resolve(rootDir, buildDirectory);
  // list of files in the out directory
  const builds = fs.readdirSync(outDir);

  // list of platforms we support
  const platforms = ['win32', 'darwin', 'linux'];
  const latestBuild = builds
    .map((fileName) => {
      // make sure it's a directory with "-" delimited platform in its name
      const stats = fs.statSync(path.join(outDir, fileName));
      const platform = fileName
        .toLocaleLowerCase()
        .split('-')
        .find((part) => platforms.includes(part));
      if (stats.isDirectory() && platform) {
        return {
          name: fileName,
          time: fs.statSync(path.join(outDir, fileName)).mtimeMs,
          platform,
        };
      }
    })
    // Usually it's just one build but if for some reason you made
    // multiple builds we'll just pick the most recent one
    .sort((a, b) => {
      const aTime = a?.time ?? 0;
      const bTime = b?.time ?? 0;
      return bTime - aTime;
    })
    .filter((file) => file)[0];

  if (!latestBuild.name) {
    throw new Error('No build found in out directory');
  }

  switch (latestBuild.platform) {
    case 'darwin':
      return path.join(
        outDir,
        latestBuild.name,
        'Boundary.app',
        'Contents',
        'MacOS',
        'Boundary',
      );
    case 'win32':
      return path.join(outDir, latestBuild.name, 'Boundary.exe');
    case 'linux':
      return path.join(outDir, latestBuild.name, 'boundary-desktop');
    default:
      throw new Error('Unsupported platform');
  }
};

export const electronTest = test.extend({
  // The screenshot/trace config option from playwright doesn't quite work since we use electron
  // so we'll manually take a screenshot/trace and attach it to the test report if the test fails.
  saveTestFailureInfo: [
    async ({ electronPage }, use, testInfo) => {
      await use();

      const path = testInfo.outputPath('trace.zip');
      await electronPage.context().tracing.stop({ path });

      // After the test we can check whether the test passed or failed.
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshot = await electronPage.screenshot();
        await testInfo.attach('screenshot', {
          body: screenshot,
          contentType: 'image/png',
        });

        await testInfo.attach('trace', { path });
      }

      // Clean up the trace files
      fs.rmSync(path);
      try {
        fs.rmdirSync(testInfo.outputPath());
      } catch {
        // Directory isn't empty, ignore error
      }
    },
    { auto: true },
  ],
  launchElectronApp: async ({ playwright }, use) => {
    const apps = [];
    await use(async (options) => {
      const app = await playwright._electron.launch({
        executablePath: getExecutablePath(),
        env: {
          NODE_ENV: 'test',
          BYPASS_APP_UPDATER: true,
          ...process.env,
        },
        ...options,
      });

      apps.push(app);
      return app;
    });

    for (const app of apps) {
      await app.close();
    }
  },
  electronApp: async ({ launchElectronApp }, use) => {
    await use(await launchElectronApp());
  },
  electronPage: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    await page.evaluate(() => localStorage.clear());
    await page.context().tracing.start({ screenshots: true, snapshots: true });

    await use(page);
  },
});
