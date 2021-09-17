// Generated during build
const config = require('./config.js');
const { isMac } = require('../src/helpers/platform.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    icon: './assets/app-icons/icon',
    name: config.productName,
    appVersion: config.releaseVersion,
    appBundleId: 'com.electron.boundary',
    appCopyright: config.copyright,
    executableName: config.executableName,
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
      config: {
        options: {
          name: 'boundary-desktop',
          version: config.releaseVersion,
          icon: './assets/app-icons/icon.png',
          description: 'Desktop Client for Boundary',
          productDescription: 'Desktop Client for Boundary',
        },
      },
    },
  ],
  hooks: {
    prePackage: () => {
      console.log(`\n[package] Release commit: ${config.releaseCommit}`);
      console.log(`[package] Release version: ${config.releaseVersion}`);

      // Check for MacOS signing identity.
      // Ignore signing identity warning for debian builds made on MacOS
      if (
        isMac() &&
        !process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY &&
        !process.env.BUILD_DEBIAN
      )
        console.warn(
          '[package] WARNING: Could not find signing identity. Proceeding without signing.'
        );
    },
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
