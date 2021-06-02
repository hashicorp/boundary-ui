const fs = require('fs');
const path = require('path');

// Create config
const createConfig = () => {
  const config = {
    name: 'boundary',
    productName: 'Boundary',
    copyright: `Copyright © ${new Date().getFullYear()} HashiCorp, Inc.`,
    releaseVersion: process.env.RELEASE_VERSION,
    releaseCommit: process.env.RELEASE_COMMIT,
  };

  if (!config.releaseVersion) config.releaseVersion = '0.0.0';
  return config;
};

// Save config to file
const saveConfig = (config, destination) => {
  const configPath = path.join(destination, 'config.js');
  const content = `module.exports = ${JSON.stringify(config, null, 2)}`;
  fs.writeFileSync(configPath, content);
  console.log(`Create: ${configPath}`);
};

module.exports = {
  setup: () => {
    const config = createConfig();
    const destination = path.resolve(__dirname);
    saveConfig(config, destination);
  },
};
