const fs = require('fs');
const path = require('path');
const { isMac, isWindows } = require('../src/helpers/platform.js');

const DEFAULT_CONFIG = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    name: 'Boundary',
    version: '0.0.0',
    appBundleId: 'com.electron.boundary',
    appCopyright: `Copyright © ${new Date().getFullYear()} HashiCorp, Inc.`,
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
};

// Create forge config based on platform
const createConfig = () => {
  const config = {
    releaseVersion: process.env.RELEASE_VERSION,
    releaseCommit: process.env.RELEASE_COMMIT,
    ...DEFAULT_CONFIG,
  };

  console.log(`[forge-config]
    Release version: ${config.releaseVersion}
    Release commit: ${config.releaseVersion}
  `);

  // Version
  config.packagerConfig.version = config.releaseVersion;

  if (isMac()) {
    config.packagerConfig.icon = './config/macos/icon.icns';
    config.packagerConfig.osxSign = {
      'hardened-runtime': true,
      entitlements: './config/macos/entitlements.plist',
      'entitlements-inherit': './config/macos/entitlements.plist',
      'signature-flags': 'library',
    };

    // Signing identity
    const signingIdentity = process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY;
    if (signingIdentity) {
      config.packagerConfig.osxSign.identity = signingIdentity;
    } else {
      console.warn(
        '[forge-config] WARNING: Could not find signing identity. Proceeding without signing.'
      );
    }

    // Generate DMG file
    config.makers.push({
      name: '@electron-forge/maker-dmg',
      config: {
        title: 'Boundary',
        name: 'boundary',
        icon: './config/macos/disk.icns',
        background: './config/macos/background.png',
      },
    });
  }

  if (isWindows()) {
    config.packagerConfig.icon = './config/windows/icon.ico';

    // Generate EXE file
    config.makers.push({
      name: '@electron-forge/maker-squirrel',
    });
  }

  return config;
};

// Save forge config file
const saveConfig = (config, destination) => {
  const configPath = path.join(destination, 'forge.config.js');
  console.log(`[forge-config] ${configPath}`);
  const content = `module.exports = ${JSON.stringify(config, null, 2)}`;
  fs.writeFileSync(configPath, content);
};

module.exports = {
  setup: () => {
    const config = createConfig();
    const destination = path.resolve(__dirname);
    saveConfig(config, destination);
  },
};
