const process = require('process');

module.exports = {
  hooks: {
    prePackage: () => {
      if (!process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY) {
        console.warn('\nWARNING: Could not find signing identity.');
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
    appCopyright: "Copyright © 2021 HashiCorp, Inc.",
    osxSign: {
      identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
      "hardened-runtime": true,
      entitlements: "./config/macos/entitlements.plist",
      "entitlements-inherit": "./config/macos/entitlements.plist",
      "signature-flags": "library"
    }
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
