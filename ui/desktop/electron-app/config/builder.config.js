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

  // removePackageScripts: true,
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
    output: 'dist',
    buildResources: './assets/app-icons',
  },
  files: ['!**/tests/*'],

  // win: {
  //   target: 'nsis',
  // },
  // nsis: {
  //   deleteAppDataOnUninstall: true,
  //   include: 'installer/win/nsis-installer.nsh',
  // },

  mac: {
    target: ['dmg', 'zip'],
    hardenedRuntime: true,
    identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
    entitlements: './assets/macos/entitlements.plist',
    entitlementsInherit: './assets/macos/entitlements.plist',
    // gatekeeperAssess: true,
  },
  dmg: {
    icon: './assets/macos/disk.icns',
    background: './assets/macos/background.png',
    "contents": [
      {
        "x": 200,
        "y": 340
      },
      {
        "x": 450,
        "y": 340,
        "type": "link",
        "path": "/Applications"
      }
    ]
  },

  // linux: {
  //   desktop: {
  //     StartupNotify: 'false',
  //     Encoding: 'UTF-8',
  //     MimeType: 'x-scheme-handler/deeplink',
  //   },
  //   target: ['AppImage', 'rpm', 'deb'],
  // },
  // deb: {
  //   priority: 'optional',
  //   afterInstall: 'installer/linux/after-install.tpl',
  // },
};
