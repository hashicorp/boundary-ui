const config = require('./config.js');
const { isMac } = require('../src/helpers/platform');
const path = require('path');
const fs = require('fs').promises;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.electron.boundary',
  buildVersion: config.releaseVersion,
  productName: config.productName,
  copyright: config.copyright,
  removePackageScripts: true,
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

  beforeBuild: async (context) => {
    // console.log(context);

    // Copy over the arch specific mac binaries before we build for the universal build
    // as we can't specify which files are arch specific
    try {
      if (context.arch === 'arm64') {
        await fs.copyFile('cli/darwin_arm64/boundary', 'cli/boundary');
      } else {
        await fs.copyFile('cli/darwin_amd64/boundary', 'cli/boundary');
      }
    } catch (e) {
      console.error('ERROR: Failed in copying over CLI.', e);
      process.exit(1);
    }
  },

  beforePack: async (context) => {
    // console.log('beforePack', context);
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
  files: ['!**/tests/*', '!cli', '!config/**'],

  win: {
    target: [{ target: 'zip', arch: 'x64' }],
    files: [
      {
        from: 'cli/windows_amd64',
        to: 'cli',
      },
    ],
  },

  mac: {
    target: [
      // { target: 'dmg', arch: 'arm64' },
      // { target: 'zip', arch: ['arm64', 'x64'], },
      { target: 'zip', arch: 'universal' },
      { target: 'dmg', arch: 'universal' },
    ],
    files: [{ from: 'cli', to: 'cli', filter: 'boundary' }],
    hardenedRuntime: true,
    identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
    entitlements: './assets/macos/entitlements.plist',
    entitlementsInherit: './assets/macos/entitlements.plist',
    // mergeASARs: true,
    // x64ArchFiles: 'Contents/Resources/app/cli/boundary',
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
      { target: 'deb', arch: 'x64' },
      { target: 'zip', arch: 'x64' },
    ],
    files: [
      {
        from: 'cli/linux_amd64',
        to: 'cli',
      },
    ],
  },
  deb: {
    // packageName: 'boundary-desktop',
    icon: './assets/app-icons/icon.png',
    description: 'Desktop Client for Boundary',
    maintainer: 'HashiCorp',
  },
};
