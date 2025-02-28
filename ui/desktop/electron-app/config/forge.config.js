// Generated during build
const config = require('./config.js');
const { isMac } = require('../src/helpers/platform.js');
const fs = require('fs');
const path = require('path');

// When SETUP_CLI=false we do not download the CLI. If there is no cli directory present
// we will not copy the CLI to the output binary.app
let extraResource = [];
if (fs.existsSync('./cli')) {
  extraResource = ['./cli'];
}

module.exports = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    icon: './assets/app-icons/icon',
    name: config.productName,
    appVersion: config.releaseVersion,
    appBundleId: 'com.electron.boundary',
    appCopyright: config.copyright,
    executableName: config.executableName,
    osxSign: {
      identity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
      'hardened-runtime': true,
      entitlements: './assets/macos/entitlements.plist',
      'entitlements-inherit': './assets/macos/entitlements.plist',
      'signature-flags': 'library',
    },
    // Add extra keys to our Info.plist
    extendInfo: {
      // Set the default notification style to be alert instead of banner
      NSUserNotificationAlertStyle: 'alert',
    },
    asar: {
      // We need to unpack node-pty helpers so we have them available
      // outside of the ASAR when they are called
      unpack: '**/node_modules/node-pty/build/Release/*',
    },
    beforeAsar: [
      async (buildPath, electronVersion, platform, arch, done) => {
        // Delete the boundary CLI before we build the ASAR as it gets copied outside
        // in the resources folder
        const cliPath = path.join(buildPath, 'cli');
        await fs.promises.rm(cliPath, { recursive: true, force: true });
        done();
      },
    ],
    extraResource,
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
        icon: './assets/macos/disk.icns',
        background: './assets/macos/background.png',
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'boundary-desktop',
          version: config.releaseVersion,
          icon: './assets/app-icons/icon.png',
          description: 'Desktop Client for Boundary',
          productDescription: 'Desktop Client for Boundary',
        },
      },
    },
  ],
  hooks: {
    prePackage: () => {
      console.log(`\n[package] Release commit: ${config.releaseCommit}`);
      console.log(`[package] Release version: ${config.releaseVersion}`);

      // Check for MacOS signing identity.
      if (isMac() && !process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY)
        console.warn(
          '[package] WARNING: Could not find signing identity. Proceeding without signing.',
        );
    },
    postPackage: async (forgeConfig, options) => {
      if (options.spinner) {
        options.spinner.info(
          `Packaged for ${options.platform}-${options.arch} at ${options.outputPaths[0]}`,
        );
      }
    },
    postMake: (forgeConfig, options) => {
      // Copy artifacts into release folder
      options.forEach(({ artifacts, platform, arch }) => {
        // Generate release name
        const version = config.releaseVersionRaw;
        const destination = path.join('out', 'release', version);
        if (!fs.existsSync(destination))
          fs.mkdirSync(destination, { recursive: true });
        // Copy artifacts
        artifacts.forEach(async (artifact) => {
          // Change arch and platform to be compliant with blob signature naming rules.
          let name;
          if (arch === 'x64') {
            arch = 'amd64';
          }

          if (platform === 'win32') {
            platform = 'windows';
          }

          if (platform === 'linux' && artifact.endsWith('.deb')) {
            name = `boundary-desktop_${version}_${arch}${path.extname(
              artifact,
            )}`;
          } else {
            name = `boundary-desktop_${version}_${platform}_${arch}${path.extname(
              artifact,
            )}`;
          }
          const artifactDestination = path.join(destination, name);
          console.log(`[release] Found artifact: ${artifact}`);
          try {
            await fs.promises.copyFile(artifact, artifactDestination);
            console.log(
              `[release] Copied artifact: ${path.resolve(artifactDestination)}`,
            );
          } catch (e) {
            console.warn(`[release] Could not copy ${artifact}`, e);
          }
        });
      });
    },
  },
};
