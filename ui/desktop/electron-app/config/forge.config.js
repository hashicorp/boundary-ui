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
  !process.env.BUILD_DEBIAN
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
          `Packaged for ${options.platform}-${options.arch} at ${options.outputPaths[0]}`
        );
      }
    },
    postMake: (forgeConfig, options) => {
      // Copy artifacts into release folder
      options.forEach(({ artifacts, platform, arch }) => {
        // Generate release name
        const version = forgeConfig.packagerConfig.appVersion;
        const destination = path.join('out', 'release', version);
        if (!fs.existsSync(destination))
          fs.mkdirSync(destination, { recursive: true });
        // Copy artifacts
        artifacts.forEach(async (artifact) => {
          const name = `boundary-desktop_${version}_${platform}_${arch}${path.extname(artifact)}`;
          const artifactDestination = path.join(destination, name);
          console.log(`[release] Found artifact: ${artifact}`);
          try {
            await fs.promises.copyFile(artifact, artifactDestination);
            console.log(`[release] Copied artifact: ${path.resolve(artifactDestination)}`);
          } catch (e) {
            console.warn(`[release] Could not copy ${artifact}`, e);
          }
        });
      });
    },
  },
};
