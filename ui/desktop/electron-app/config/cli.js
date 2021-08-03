const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const decompress = require('decompress');
const { isMac, isWindows } = require('../src/helpers/platform.js');

const artifactDestination = path.resolve(__dirname, '..', 'cli');

const downloadArtifact = (version) => {
  const archivePlatform = {};
  // TODO: Support all available build machines
  if (isMac()) {
    archivePlatform.name = 'darwin';
    archivePlatform.arch = 'amd64';
  }

  if (isWindows()) {
    archivePlatform.name = 'windows';
    archivePlatform.arch = 'amd64';
  }

  const archiveName = `boundary_${version}_${archivePlatform.name}_${archivePlatform.arch}.zip`;
  const url = `https://releases.hashicorp.com/boundary/${version}/${archiveName}`;
  return new Promise((resolve, reject) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-artifact-'));
    console.log('Create tmp artifact directory: ', tmpDir);

    const artifactFileName = url.split('/').pop();
    if (!artifactFileName)
      reject(`Could not find artifact filename in: ${url}.`);

    const artifactPath = path.resolve(tmpDir, artifactFileName);
    console.log('Download artifact url: ', url);
    https.get(url, (response) => {
      if (response.statusCode >= 400) reject('Could not access artifact url.');
      const stream = response.pipe(fs.createWriteStream(artifactPath));
      stream.on('close', () => resolve(artifactPath));
      stream.on('error', reject);
    });
  });
};

const extract = (artifactPath, destination) => {
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);
  console.log('Extract artifact to: ', destination);
  return decompress(artifactPath, destination);
};

module.exports = {
  setup: async () => {
    if (process.env.BYPASS_CLI_SETUP) {
      console.warn('WARNING: Bypassing cli setup');
      return;
    }
    try {
      const artifactVersion = await fs.promises.readFile(
        path.resolve(__dirname, 'cli', 'VERSION'),
        'utf8'
      );
      const artifactPath = await downloadArtifact(artifactVersion);
      await extract(artifactPath, artifactDestination);
    } catch (e) {
      console.error('ERROR: Failed setting up CLI.', e);
      process.exit(1);
    }
  },
};
