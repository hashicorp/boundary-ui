const fs = require('fs');
const path = require('path');

// Create config for use in electron forge
const createConfig = () => {
  const configPath = path.join(__dirname, '..', 'config');
  const macosConfigPath = path.join(configPath, 'macos');
  const appIconPath = path.join(configPath, 'app-icons', 'icon');

  const config = {
    name: 'boundary',
    productName: 'Boundary',
    bundleId: 'com.electron.boundary',
    copyright: `Copyright © ${new Date().getFullYear()} HashiCorp, Inc.`,
    releaseVersion: process.env.RELEASE_VERSION,
    releaseCommit: process.env.RELEASE_COMMIT,
    icon: appIconPath,
    macos: {
      hardenedRuntime: true,
      entitlements: path.join(macosConfigPath, 'entitlements.plist'),
      signatureFlags: 'library',
      signingIdentity: process.env.BOUNDARY_DESKTOP_SIGNING_IDENTITY,
      dmg: {
        diskIcon: path.join(macosConfigPath, 'disk.icns'),
        background: path.join(macosConfigPath, 'background.png'),
      },
    },
  };

  if (!config.releaseVersion) {
    config.releaseVersion = '0.0.0';
    console.warn(
      `[desktop-config] Release version not specified. Using: ${config.releaseVersion} instead`
    );
  }

  console.log(`[desktop-config] Release commit: ${config.releaseCommit}`);
  console.log(`[desktop-config] Release version: ${config.releaseVersion}`);

  // MacOS signing identity
  if (!config.macos.signingIdentity)
    console.warn(
      '[desktop-config] WARNING: Could not find signing identity. Proceeding without signing.'
    );

  return config;
};

// Save config file
const saveConfig = (config, destination) => {
  const configPath = `${destination}/config.js`;
  console.log(`[desktop-config] Config: ${configPath}`);
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
