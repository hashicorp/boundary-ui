// Generated during build
const config = require('./config.js');
const { isMac } = require('../src/helpers/platform.js');
const fs = require('fs');
const path = require('path');

console.log(`\n[forge-config] Release commit: ${config.releaseCommit}`);
console.log(`[forge-config] Release version: ${config.releaseVersion}`);

// MacOS signing identity.
// Ignore signing identity warning for debian builds run on MacOS
if (
  isMac() &&
  !process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY &&
  !process.env.CLI_LINUX_DEBIAN_SUPPORT
)
  console.warn(
    '[forge-config] WARNING: Could not find signing identity. Proceeding without signing.'
  );

module.exports = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    icon: './assets/app-icons/icon',
    name: config.productName,
    appVersion: config.releaseVersion,
    appBundleId: 'com.electron.boundary',
    appCopyright: config.copyright,
    osxSign: {
      identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
      'hardened-runtime': true,
      entitlements: './assets/macos/entitlements.plist',
      'entitlements-inherit': './assets/macos/entitlements.plist',
      'signature-flags': 'library',
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        title: config.productName,
        name: config.name,
        icon: './assets/macos/disk.icns',
        background: './assets/macos/background.png',
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
    },
    {
      name: '@electron-forge/maker-deb',
      dist: 'out/test',
      options: {
        name: config.name,
        productName: config.productName,
      },
    },
  ],
  hooks: {
    postPackage: async (forgeConfig, options) => {
      if (options.spinner) {
        options.spinner.info(
          `Completed packaging for platform: ${options.platform} arch: ${options.arch} at ${options.outputPaths[0]}`
        );
      }
    },
    postMake: (forgeConfig, options) => {
      // Copy artifacts into release folder
      options.forEach(({ artifacts, platform, arch }) => {
        // Generate platform arch folder name
        const folder = `boundary-desktop_${forgeConfig.packagerConfig.appVersion}_${platform}_${arch}`;
        const destination = path.join('out', 'artifacts', folder);
        if (!fs.existsSync(destination))
          fs.mkdirSync(destination, { recursive: true });
        // Copy artifacts
        artifacts.forEach(async (artifact) => {
          const artifactDestination = path.join(
            destination,
            path.basename(artifact)
          );
          console.log(`Copy ${artifact} into ${artifactDestination}.`);
          try {
            await fs.promises.copyFile(artifact, artifactDestination);
          } catch (e) {
            console.log(`Could not copy ${artifact}`, e);
          }
        });
      });
    },
  },
};
