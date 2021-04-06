const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse } = require('node-html-parser');
const { autoUpdater, dialog } = require('electron');

// Query release site to find latest available version
const findLatestVersion = (url) => {
  return new Promise((resolve, reject) => {
    let data = '';
    https.get(url, (response) => {
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const html = parse(data);
        // Ignore first link as it navigates to root
        const fullVersion = html.querySelectorAll('a')[1].innerHTML;
        const version = {
          name: fullVersion,
          tag: fullVersion.split('_')[1],
        };
        resolve(version);
      });
      response.on('error', (err) => reject(err));
    });
  });
};

// Download update archive from releases
const downloadUpdateArtifact = (url, archiveDestination) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(archiveDestination)) fs.mkdirSync(archiveDestination);

    const artifactFileName = url.split('/').pop();
    if (!artifactFileName) reject('Could not find artifact filename in: ', url);

    const artifactPath = path.resolve(archiveDestination, artifactFileName);
    https.get(url, (response) => {
      const stream = response.pipe(fs.createWriteStream(artifactPath));
      stream.on('close', () => resolve(artifactPath));
      stream.on('error', reject);
    });
  });
};

// Create update config using downloaded archive
const createUpdateConfig = (path, destination) => {
  const json = { url: `file://${path}` };
  const feedPath = `${destination}/feed.json`;
  fs.writeFileSync(feedPath, JSON.stringify(json));
  return feedPath;
};

const downloadAndInstallUpdate = async (url, destination) => {
  const artifactPath = await downloadUpdateArtifact(url, destination);
  const configPath = createUpdateConfig(artifactPath, destination);

  console.log('setFeedURL: ', `file://${configPath}`);
  autoUpdater.setFeedURL(`file://${configPath}`);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
  });

  // Is this still needed? Does quitAndInstall do what's needed?
  // autoUpdater.checkForUpdates();
};

/*
  TODO:
    - download progress in dialog
*/
module.exports = {
  run: async () => {
    // const releasesUrl = 'https://localhost:1313/releases/boundary-desktop/';
    const releasesUrl = 'https://releases.hashicorp.com/boundary-desktop/';
    const current = {
      name: 'boundary-desktop_1.0.0-alpha',
      tag: '1.0.0-alpha',
    };

    // scrape html to find first record in releaseurl to find version
    // DEV ONLY
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const latest = await findLatestVersion(releasesUrl);
    // No update available - do nothing
    if (latest.tag <= current.tag) {
      const dialogOpts = {
        type: 'info',
        icon: null,
        detail: 'You are on the latest version.',
      };

      dialog.showMessageBox(dialogOpts);
      return;
    }

    // Update is available - should we proceed?
    const dialogOpts = {
      type: 'info',
      buttons: ['Download', 'Later'],
      icon: null,
      detail:
        'A new version is available for download. Proceed with download to update.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        const url = `${releasesUrl}${latest.name}/${latest.name}_darwin_amd64.zip`;
        const destination = path.resolve(__dirname, '..', 'updateArchive');
        downloadAndInstallUpdate(url, destination);
      }
    });
  },
};
