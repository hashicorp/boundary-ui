const config = require('./config.js');

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

  // afterSign: async (context) => {
  //   // Mac releases require hardening+notarization: https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution
  //   if (!isDebug && context.electronPlatformName === "darwin") {
  //     await notarizeMac(context)
  //   }
  // },
  // artifactBuildStarted: (context) => {
  //   identifyLinuxPackage(context)
  // },
  // afterAllArtifactBuild: (buildResult) => {
  //   return stampArtifacts(buildResult)
  // },
  // force arch build if using electron-rebuild
  // beforeBuild: async (context) => {
  //   const { appDir, electronVersion, arch } = context
  //   await electronRebuild.rebuild({ buildPath: appDir, electronVersion, arch })
  //   return false
  // },

  directories: {
    // app: '.',
    output: 'out',
    buildResources: './assets/app-icons',
  },
  files: ['!**/tests/*'],

  win: {
    target: ['zip'],
  },

  mac: {
    target: ['dmg', 'zip'],
    hardenedRuntime: true,
    identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
    entitlements: './assets/macos/entitlements.plist',
    entitlementsInherit: './assets/macos/entitlements.plist',
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
    target: ['deb', 'zip'],
  },
  deb: {
    packageName: 'boundary-desktop',
    icon: './assets/app-icons/icon.png',
    description: 'Desktop Client for Boundary',
    maintainer: 'HashiCorp',
  },
};
