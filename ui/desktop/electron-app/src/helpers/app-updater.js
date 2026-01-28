/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const semver = require('semver');
const { parse } = require('node-html-parser');
const { autoUpdater, dialog, app } = require('electron');
const { isWindows, isLinux } = require('../helpers/platform.js');
const config = require('../../config/config.js');
const log = require('electron-log/main');
const boundaryCli = require('../cli/index.js');

const currentVersion = config.releaseVersion;
const debug = process.env.DEBUG_APP_UPDATER;
const releasesUrl = 'https://releases.hashicorp.com/boundary-desktop/';

// Returns the real CPU architecture of the machine.
const returnArchitectureToUpdate = () => {
  const nodeArchitecture = process.arch;

  if (nodeArchitecture === 'arm64') {
    return nodeArchitecture;
  }

  try {
    if (app.runningUnderARM64Translation) {
      return 'arm64';
    }
  } catch (err) {
    log.error(`returnArchitectureToUpdate:`, err.message);
  }
  return 'amd64';
};

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

// Find zip archive for update
const findUpdateArchive = (version) => {
  const architecture = returnArchitectureToUpdate();
  const url = `${releasesUrl}${version}/boundary-desktop_${version}_darwin_${architecture}.zip`;
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        resolve(url);
      } else {
        reject({ message: 'Archive not available' });
      }
      response.on('error', (err) => reject(err));
    });
  });
};

// Create update config using downloaded archive
const createAppUpdaterConfig = (url, version, destination) => {
  if (debug)
    console.log(`[app-updater] url: ${url}, destination: ${destination}`);
  const json = { url, version };
  const config = JSON.stringify(json);
  const configPath = path.join(destination, 'feed.json');
  if (debug) console.log(`[app-updater] config: ${config}`);
  fs.writeFileSync(configPath, config);
  return configPath;
};

const downloadAndInstallUpdate = async (version, url) => {
  try {
    const destination = path.resolve(process.resourcesPath, 'nextVersion');
    if (!fs.existsSync(destination)) fs.mkdirSync(destination);

    const configPath = createAppUpdaterConfig(url, version, destination);
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
 * Show update not available prompt only when allowed.
 **/
const displayInfoPrompt = () => {
  const dialogOpts = {
    type: 'info',
    icon: null,
    detail: 'No updates available',
  };

  dialog.showMessageBox(dialogOpts);
};

/**
 * Show update available prompt
 */
const displayDownloadPrompt = (latestVersion, url) => {
  let detail = 'A new version is available for download.';

  const dialogOpts = {
    type: 'info',
    buttons: ['Download', 'Later'],
    icon: null,
    detail,
  };

  // If the user's current version is less than 2.0.0, show a warning that upgrading might not be compatible
  if (semver.lt(currentVersion, '2.0.0')) {
    dialogOpts.detail += `\n\nThis is a major version upgrade which could be incompatible with your current controller version.`;
    dialogOpts.type = 'warning';
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      downloadAndInstallUpdate(latestVersion, url);
    }
  });
};

/**
 * Configure inbuilt app updater to use a custom config file
 * to download and install next available app version.
 * TODO: download progress in dialog
 **/
module.exports = {
  run: async ({ suppressNoUpdatePrompt } = {}) => {
    /**
     * Ignore app updater prompts.
     */
    if (process.env.BYPASS_APP_UPDATER) return;

    /**
     * Disable app updater check for linux as update is unsupported.
     * TODO: Enable for windows pending feature dev. Windows is supported.
     */
    if (isWindows() || isLinux()) return;

    /**
     * Skip the app updater if we are NOT using the built in CLI
     */
    if (!boundaryCli.isBuiltInCli) return;

    const latestVersion = await findLatestVersion(releasesUrl);

    // Ensure version is in proper format
    if (!semver.valid(latestVersion)) {
      latestVersion = semver.coerce(latestVersion);
    }

    /**
     * Update not available - do nothing
     * lte(v1, v2): v1 <= v2
     **/
    if (semver.lte(latestVersion, currentVersion)) {
      if (!suppressNoUpdatePrompt) displayInfoPrompt();
      return;
    }

    /**
     * Find archive for update and prompt user when it's available.
     * Ignore otherwise.
     **/
    findUpdateArchive(latestVersion)
      .then((url) => {
        // Update is available - prompt for download
        displayDownloadPrompt(latestVersion, url);
      })
      .catch((e) => {
        if (debug) console.error('[app-updater]', e);
        if (!suppressNoUpdatePrompt) displayInfoPrompt();
      });
  },
};
