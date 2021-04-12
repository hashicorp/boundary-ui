const fs = require('fs');
const path = require('path');
const https = require('https');
const semver = require('semver');
const { parse } = require('node-html-parser');
const { autoUpdater, dialog } = require('electron');

const debug = process.env.DEBUG_APP_UPDATER;
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

// Create update config using downloaded archive
const createAppUpdaterConfig = (url, version, destination) => {
  if (debug) console.log(`[app-updater] url: ${url}, destination: ${destination}`);
  const json = { url, version};
  const config = JSON.stringify(json);
  const configPath = `${destination}/feed.json`;
  if (debug) console.log(`[app-updater] config: ${config}`);
  fs.writeFileSync(configPath, config);
  return configPath;
};

const downloadAndInstallUpdate = async (version) => {
  const url = `${releasesUrl}boundary-desktop_${version}/boundary-desktop_${version}_darwin_amd64.zip`;
  const destination = path.resolve(__dirname, '..', 'nextVersion');
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);

  try {
    let configPath;
    if (debug) {
      // Support hosted url and file paths
      const location = process.env.APP_UPDATER_LATEST_VERSION_LOCATION;
      configPath = createAppUpdaterConfig(
        location.match(/^https/i) ? location : `file://${location}`,
        version,
        destination
      );
    } else {
      configPath = createAppUpdaterConfig(url, version, destination);
    }

    autoUpdater.on('update-downloaded', () => {
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

    if (debug) console.log('[app-updater] config:', configPath);
    autoUpdater.setFeedURL(`file://${configPath}`);
    autoUpdater.checkForUpdates();
  } catch (e) {
    dialog.showErrorBox('Could not update', e.message);
  }
};

/**
 * Configure inbuilt app updater to use a custom config file
 * to download and install next available app version.
 * TODO: download progress in dialog
 * TODO: Read current version from app config
 **/
module.exports = {
  run: async () => {
    let latestVersion;
    if (debug) {
      latestVersion = process.env.APP_UPDATER_LATEST_VERSION_TAG;
    } else {
      latestVersion = await findLatestVersion(releasesUrl);
    }

    // Ensure version is in proper format
    if (!semver.valid(latestVersion)) {
      latestVersion = semver.coerce(latestVersion);
    }

    // Update not available - do nothing
    if (semver.lte(latestVersion, currentVersion)) {
      const dialogOpts = {
        type: 'info',
        icon: null,
        detail: 'No updates available',
      };

      dialog.showMessageBox(dialogOpts);
      return;
    }

    // Update is available - prompt for download
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
