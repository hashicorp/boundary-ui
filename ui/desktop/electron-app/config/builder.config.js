const config = require('./config.js');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.electron.boundary',
  buildVersion: config.releaseVersion,
  artifactName: '${productName}-${os}-${arch}-${version}.${ext}',
  productName: config.productName,
  copyright: config.copyright,
  removePackageScripts: true,
  asar: false,

  beforePack: async (context) => {
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
  files: ['!**/tests/*', '!cli'],

  win: {
    target: [{ target: 'zip', arch: 'x64' }],
    files: [
      {
        from: 'cli/windows_x64',
        to: 'cli',
      },
    ],
  },

  mac: {
    target: [
      // { target: 'zip', arch: ['arm64', 'x64'], },
      // { target: 'dmg', arch: ['arm64', 'x64'] },
      { target: 'zip', arch: 'universal' },
      { target: 'dmg', arch: 'universal' },
    ],
    files: [{ from: 'cli/${platform}_${arch}', to: 'cli' }],
    hardenedRuntime: true,
    // identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
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
        from: 'cli/linux_x64',
        to: 'cli',
      },
    ],
  },
  deb: {
    icon: './assets/app-icons/icon.png',
    description: 'Desktop Client for Boundary',
    maintainer: 'HashiCorp',
  },
};
