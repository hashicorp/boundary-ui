const process = require('process');

module.exports = {
  hooks: {
    preMake: (forgeConfig) => {
      if (process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY) {
        forgeConfig.packagerConfig.osxSign = {
          identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
          hardenedRuntime: true,
          "gatekeeper-assess": false,
          entitlements: "config/macos/entitlements.plist",
          "entitlements-inherit": "config/macos/entitlements.plist",
          "signature-flags": "library"
        }
      } else {
        console.warn('Could not find signing identity. Skipping signing.');
      }
    }
  },
  packagerConfig: {
    ignore: [
      "/ember-test(/|$)",
      "/tests(/|$)"
    ],
    name: "Boundary Desktop",
    appBundleId: "com.electron.boundary",
    appVersion: "0.0.1",
    appCopyright: "Copyright © 2021 HashiCorp, Inc."
  },
  makers: [
    {
      name: "@electron-forge/maker-dmg",
      config: {
        name: "Boundary Desktop"
      }
    }
  ]
}
