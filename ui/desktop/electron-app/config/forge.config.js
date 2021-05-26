// Generated during build
const config = require('./config.js');

module.exports = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    icon: config.icon,
    name: config.productName,
    appVersion: config.version,
    appBundleId: config.bundleId,
    appCopyright: config.copyright,
    osxSign: {
      identity: config.macos.signingIdentity,
      'hardened-runtime': config.macos.hardenedRuntime,
      entitlements: config.macos.entitlements,
      'entitlements-inherit': config.macos.entitlements,
      'signature-flags': config.macos.signatureFlags,
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
        icon: config.macos.dmg.diskIcon,
        background: config.macos.dmg.background,
      },
    },
  ],
};
