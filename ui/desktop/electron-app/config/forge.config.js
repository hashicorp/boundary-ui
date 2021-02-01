const process = require('process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const decompress = require('decompress');
const os = require('os');

module.exports = {
  hooks: {
    prePackage: async () => {
      const downloadArtifact = (url) => {
        return new Promise((resolve, reject) => {
          const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-desktop-artifact-'))
          console.log('\nCreate tmp artifact directory: ', tmpDir);

          const artifactFileName = url.split('/').pop();
          if(!artifactFileName) reject('Could not find artifact filename in: ', url);

          const artifactPath = path.resolve(tmpDir, artifactFileName);
          console.log('\nDownload artifact url: ', url);
          https.get(url, (response) => {
            const stream = response.pipe(fs.createWriteStream(artifactPath))
            stream.on('close', () => resolve(artifactPath));
            stream.on('error', reject);
          });
        });
      }

      // Download boundary
      const artifactVersion = '0.1.4';
      const url = `https://releases.hashicorp.com/boundary/${artifactVersion}/boundary_${artifactVersion}_darwin_amd64.zip`;
      const artifactPath = await downloadArtifact(url);

      // Extract artifact content
      const binaryPath = path.resolve(__dirname, '..', 'src', 'binary');
      if (!fs.existsSync(binaryPath)) fs.mkdirSync(binaryPath);
      console.log('\nExtract artifact to: ', binaryPath);
      await decompress(artifactPath, binaryPath);
    },
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
