const fs = require('fs');
const path = require('path');
const https = require('https');
const decompress = require('decompress');
const os = require('os');

const artifactVersion = '0.2.2';
const artifactDestination = path.resolve(__dirname, '..', 'cli');

const platform = {
  name: 'darwin',
  arch: 'amd64',
};
if(os.type().match(/(windows)/i)) {
  platform.name = 'windows';
  arch = 'amd64';
}

const downloadArtifact = version => {
  const url = `https://releases.hashicorp.com/boundary/${version}/boundary_${version}_${platform.name}_${platform.arch}.zip`;
  return new Promise((resolve, reject) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-artifact-'));
    console.log('Create tmp artifact directory: ', tmpDir);

    const artifactFileName = url.split('/').pop();
    if(!artifactFileName) reject('Could not find artifact filename in: ', url);

    const artifactPath = path.resolve(tmpDir, artifactFileName);
    console.log('Download artifact url: ', url);
    https.get(url, (response) => {
      const stream = response.pipe(fs.createWriteStream(artifactPath))
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
      const artifactPath = await downloadArtifact(artifactVersion);
      await extract(artifactPath, artifactDestination);
  }
}
