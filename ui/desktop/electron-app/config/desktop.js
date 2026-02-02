const fs = require('fs');
const path = require('path');
const { isLinux } = require('../src/helpers/platform.js');

/** Always returns a valid semVer. Composed of Major.Minor.Path and all valid integers
 * Otherwise we run into this issue: https://github.com/electron/packager/issues/1714#issuecomment-2091266284
 */
const returnSemVerFromReleaseVersion = (releaseVersion) => {
  let [major, minor, patch] = releaseVersion.split('.').slice(0, 3);

  // Delete, if present, v from Major
  if (!parseInt(major)) {
    major = major.replace('v', '');
  }
  // parseInt the patch to eliminate any text after the version integer.
  return `${major}.${minor}.${parseInt(patch)}`;
};

// Create config
const createConfig = () => {
  const config = {
    name: 'boundary',
    productName: 'Boundary',
    copyright: `Copyright © ${new Date().getFullYear()} IBM Corp.`,
    releaseVersion: process.env.RELEASE_VERSION,
    releaseCommit: process.env.RELEASE_COMMIT,
    executableName: 'Boundary',
    releaseVersionRaw: process.env.RELEASE_VERSION,
  };

  // Take a valid release version in semVer format.
  if (!config.releaseVersion) {
    config.releaseVersion = '0.0.0';
    config.releaseVersionRaw = '0.0.0';
  } else {
    config.releaseVersion = returnSemVerFromReleaseVersion(
      config.releaseVersion,
    );
  }

  if (isLinux()) config.executableName = 'boundary-desktop';
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
