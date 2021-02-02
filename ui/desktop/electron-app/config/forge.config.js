const process = require('process');
const { version } = require('../src/boundary-cli.js');

const formattedCLIVersion = version().formatted;

module.exports = {
  hooks: {
    preMake: (forgeConfig) => {
      if (process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY) {
        forgeConfig.osxSign = {
          identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
          hardenedRuntime: true,
          "gatekeeper-assess": false,
          entitlements: "config/macos/entitlements.plist",
          "entitlements-inherit": "config/macos/entitlements.plist",
          "signature-flags": "library"
        }
      } else {
        console.warn('WARNING: Could not find signing identity. Skipping signing.');
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
    // TODO: where should the client version number come from?
    appVersion: `1.0.0 ${formattedCLIVersion}`,
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
