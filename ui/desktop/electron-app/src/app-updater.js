const fs = require('fs');
const path = require('path');
const https = require('https');
const isDev = require('electron-is-dev');
const { parse } = require('node-html-parser');
const { autoUpdater, dialog } = require('electron');

const releasesUrl = 'https://releases.hashicorp.com/boundary-desktop/';
const currentVersion = '1.0.0-beta';

// Query releases url to find latest version
const findLatestVersion = (url) => {
  return new Promise((resolve, reject) => {
    let data = '';
    https.get(url, (response) => {
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        const html = parse(data);
        // Ignore first link as it navigates to root
        const fullVersion = html.querySelectorAll('a')[1].innerHTML;
        resolve(fullVersion.split('_')[1]);
      });
      response.on('error', (err) => reject(err));
    });
  });
};

// Download latest version from releases
// const downloadLatestVersion = (url, archiveDestination) => {
//   return new Promise((resolve, reject) => {
//     if (!fs.existsSync(archiveDestination)) fs.mkdirSync(archiveDestination);

//     const artifactFileName = url.split('/').pop();
//     if (!artifactFileName) reject('Could not find artifact filename in: ', url);

//     const artifactPath = path.resolve(archiveDestination, artifactFileName);
//     https.get(url, (response) => {
//       const stream = response.pipe(fs.createWriteStream(artifactPath));
//       stream.on('close', () => resolve(artifactPath));
//       stream.on('error', reject);
//     });
//   });
// };

// Create update config using downloaded archive
const createAppUpdaterConfig = (url, destination) => {
  // https vs file
  const json = { url: `file://${path}` };
  const config = JSON.stringify(json);
  const configPath = `${destination}/feed.json`;
  if (isDev) console.log(`[app-updater] config: ${config}`);
  fs.writeFileSync(configPath, config);
  return configPath;
};

const downloadAndInstallUpdate = async (version) => {
  const url = `${releasesUrl}boundary-desktop_${version}/boundary-desktop_${version}_darwin_amd64.zip`;
  const destination = path.resolve(__dirname, '..', 'updateArchive');
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);

  try {
      // can be converted into find zip url and use it instead of downloading it
      // const artifactPath = await downloadLatestVersion(url, destination);

    let configPath;
    if (isDev && process.env.ENABLE_DEV_UPDATE_CONFIG) {
      configPath = createAppUpdaterConfig(
        process.env.LATEST_VERSION_LOCATION,
        destination
      );
    } else {
      configPath = createAppUpdaterConfig(url, destination);
    }

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        detail:
          'A new version has been downloaded. Restart the application to apply the updates.',
      };
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall(true, true);
      });
    });

    autoUpdater.on('error', (e) => {
      dialog.showErrorBox('Could not update', e.message);
    });

    if (isDev) console.log('[app-updater] config:', configPath);
    autoUpdater.setFeedURL(`file://${configPath}`);
    autoUpdater.checkForUpdates();
  } catch (e) {
    dialog.showErrorBox('Could not update', e.message);
  }
};

/*
  TODO:
    - download progress in dialog
    - Alternate to specifying current version
*/
module.exports = {
  run: async () => {
    let latestVersion;
    if (isDev && process.env.ENABLE_DEV_UPDATE_CONFIG) {
      latestVersion = process.env.LATEST_VERSION_TAG;
    } else {
      latestVersion = await findLatestVersion(releasesUrl);
    }

    // No update available - do nothing
    if (latestVersion <= currentVersion) {
      const dialogOpts = {
        type: 'info',
        icon: null,
        detail: 'No updates available',
      };

      dialog.showMessageBox(dialogOpts);
      return;
    }

    // Update is available - should we proceed?
    const dialogOpts = {
      type: 'info',
      buttons: ['Download', 'Later'],
      icon: null,
      detail: 'A new version is available for download',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        downloadAndInstallUpdate(latestVersion);
      }
    });
  },
};
