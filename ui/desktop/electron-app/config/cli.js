/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');
const { isMac, isWindows, isLinux } = require('../src/helpers/platform.js');

const artifactDestination = path.resolve(__dirname, '..', 'cli');

const downloadArtifact = (version) => {
  const archivePlatform = {};
  if (isMac()) {
    archivePlatform.name = 'darwin';
    let arch = os.arch();
    // Map x64 to amd64 cli artifact
    if (arch.match(/(x64)/i)) arch = 'amd64';
    archivePlatform.arch = arch;
  }

  if (isWindows()) {
    archivePlatform.name = 'windows';
    archivePlatform.arch = 'amd64';
  }

  if (isLinux()) {
    let arch = os.arch();
    // Map x64 to amd64 cli artifact
    if (arch.match(/(x64)/i)) arch = 'amd64';
    archivePlatform.name = os.platform();
    archivePlatform.arch = arch;
  }

  console.log(
    `Download cli for platform: ${archivePlatform.name} arch: ${archivePlatform.arch}`,
  );

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

const extract = async (artifactPath, destination) => {
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);
  const directory = await unzipper.Open.file(artifactPath);

  return Promise.all(
    directory.files.map((file) => {
      return new Promise((resolve, reject) => {
        file
          .stream()
          .pipe(
            fs.createWriteStream(path.join(destination, file.path), {
              // Creating a new file stream sets the permission bits on the file
              // to node's default. We need to set the permission bits ourselves.
              // We could just force the mode to 0o755, but we can also just convert it.
              // This should also work on windows as the permission bits will still be set
              // correctly but they just won't have any effect.
              // Taken from here: https://github.com/thejoshwolfe/yauzl/issues/101#issuecomment-448073570
              mode: file.externalFileAttributes >>> 16,
            }),
          )
          .on('error', reject)
          .on('finish', resolve);
      });
    }),
  );
};

module.exports = {
  setup: async () => {
    if (process.env.SETUP_CLI === 'true') {
      try {
        const artifactVersion = await fs.promises.readFile(
          path.resolve(__dirname, 'cli', 'VERSION'),
          'utf8',
        );
        const artifactPath = await downloadArtifact(artifactVersion.trim());
        await extract(artifactPath, artifactDestination);
      } catch (e) {
        console.error('ERROR: Failed setting up CLI.', e);
        process.exit(1);
      }
    } else {
      console.warn('WARNING: Bypassing cli setup');
    }
  },
};
