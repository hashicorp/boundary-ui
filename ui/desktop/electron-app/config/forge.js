const fs = require('fs');
const path = require('path');
const { isMac, isWindows } = require('../src/helpers/platform.js');

const DEFAULT_CONFIG = {
  packagerConfig: {
    ignore: ['/ember-test(/|$)', '/tests(/|$)'],
    name: 'Boundary',
    version: '0.0.0',
    appBundleId: 'com.electron.boundary',
    appCopyright: 'Copyright © 2021 HashiCorp, Inc.',
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
}

// Create forge config based on platform
const createConfig = () => {
  const config = { ...DEFAULT_CONFIG };

  // Store env vars in config
  ['RELEASE_COMMIT', 'RELEASE_VERSION'].forEach((envVar) => {
    if (process.env[envVar]) {
      config[envVar] = process.env[envVar];
      console.log(`[forge-config] ${envVar} ${config[envVar]}`);
    }
  });

  // Version
  if (config.RELEASE_VERSION)
    config.packagerConfig.version = config.RELEASE_VERSION;

  if (isMac) {
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

  if (isWindows) {
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
