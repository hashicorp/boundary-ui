const config = require('./config.js');
const { isMac } = require('../src/helpers/platform');
const path = require('path');
const fs = require('fs');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.electron.boundary',
  buildVersion: config.releaseVersion,
  productName: config.productName,
  copyright: config.copyright,
  asar: false,

  // afterAllArtifactBuild: (buildResult) => {
  // console.log('buildResult', buildResult);
  // const version = config.releaseVersion;
  // const destination = path.join('out', 'release', version);
  // if (!fs.existsSync(destination)) {
  //   fs.mkdirSync(destination, { recursive: true });
  // }
  //
  // // Grab only the artifacts that end with .zip, .dmg, or .deb
  // const artifactPaths = buildResult.artifactPaths.filter((path) =>
  //   /^.*\.(zip|dmg|deb)$/.test(path)
  // );
  //
  // artifactPaths.forEach(path => {
  //   const name = `boundary-desktop_${version}_${platform}_${arch}${path.extname(artifact)}`;
  //   const artifactDestination = path.join(destination, name);
  //   console.log(`[release] Found artifact: ${artifact}`);
  //   try {
  //     await fs.promises.copyFile(path, artifactDestination);
  //     console.log(`[release] Copied artifact: ${path.resolve(artifactDestination)}`);
  //   } catch (e) {
  //     console.warn(`[release] Could not copy ${artifact}`, e);
  //   }
  //
  // })
  // },
  beforePack: async (context) => {
    // console.log('beforeBuild', context);
    console.log(`\n[package] Release commit: ${config.releaseCommit}`);
    console.log(`[package] Release version: ${config.releaseVersion}`);

    // Check for MacOS signing identity.
    // Ignore signing identity warning for debian builds made on MacOS
    if (
      context.packager.platform.name === 'mac' &&
      !process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY &&
      !process.env.BUILD_DEBIAN
    )
      console.warn(
        '[package] WARNING: Could not find signing identity. Proceeding without signing.'
      );
  },

  directories: {
    // app: '.',
    output: 'out',
    buildResources: './assets/app-icons',
  },
  files: ['!**/tests/*'],

  win: {
    target: [{ target: 'zip', arch: 'arm64' }],
  },

  mac: {
    target: [
      { target: 'dmg', arch: 'arm64' },
      { target: 'zip', arch: 'arm64' },
    ],
    hardenedRuntime: true,
    identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
    entitlements: './assets/macos/entitlements.plist',
    entitlementsInherit: './assets/macos/entitlements.plist',
    // mergeASARs: false,
  },
  dmg: {
    icon: './assets/macos/disk.icns',
    background: './assets/macos/background.png',
    title: config.productName,
    contents: [
      {
        x: 200,
        y: 340,
      },
      {
        x: 450,
        y: 340,
        type: 'link',
        path: '/Applications',
      },
    ],
  },

  linux: {
    target: [
      { target: 'deb', arch: 'arm64' },
      { target: 'zip', arch: 'arm64' },
    ],
  },
  deb: {
    // packageName: 'boundary-desktop',
    icon: './assets/app-icons/icon.png',
    description: 'Desktop Client for Boundary',
    maintainer: 'HashiCorp',
  },
};
