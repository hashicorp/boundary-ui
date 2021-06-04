// Generated during build
const config = require('./config.js');
const { isMac } = require('../src/helpers/platform.js');

console.log(`\n[forge-config] Release commit: ${config.releaseCommit}`);
console.log(`[forge-config] Release version: ${config.releaseVersion}`);

// MacOS signing identity
if (isMac() && !process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY)
  console.warn(
    '[forge-config] WARNING: Could not find signing identity. Proceeding without signing.'
  );

module.exports = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    icon: './assets/app-icons/icon',
    name: config.productName,
    appVersion: config.version,
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
  ],
};
