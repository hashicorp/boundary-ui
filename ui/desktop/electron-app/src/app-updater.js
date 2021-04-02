const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const { app, autoUpdater, dialog } = require('electron');

const releasesUrl = 'https://localhost:1313/releases/boundary-desktop';
// const releasesUrl = 'https://releases.hashicorp.com/boundary-desktop';
// const url = `https://releases.hashicorp.com/boundary/${version}/boundary_${version}_darwin_amd64.zip`;
const currentVersion = '1.0.0-beta';
const updateArchiveDestination = path.resolve(__dirname, '..', 'updateArchive');

const isUpdateAvailable = () => {
};

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

const createUpdateConfig = (path, destination) => {
  const json = { url: `file://${path}` };
  const feedPath = `${destination}/feed.json`;
  fs.writeFileSync(feedPath, JSON.stringify(json));
  return feedPath;
};

/*
  TODO:
    - version check before downloading artifact
    - download progress in dialog
    - Update now dialog with cancel button?
    - Uptodate dialog - no update available
    - 
*/

module.exports = {
  run: async () => {
    // if(!isUpdateAvailable()) {
    //   // show dialog box that everything is uptodate 
    // }

    // scrape html to find first record in releaseurl to find version
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    // https.get(releasesUrl, (res) => {
    //   console.log('statusCode:', res.statusCode);
    //   console.log('headers:', res.headers);
  
    //   res.on('data', (d) => {
    //     process.stdout.write(d);
    //     console.log('body: ', d);
    //     debugger;
    //   });
    
    // }).on('error', (e) => {
    //   console.error(e);
    // });
    const updateVersion = '1.0.3';
    const url = `${releasesUrl}/${updateVersion}/boundary_${updateVersion}_darwin_amd64.zip`;
    // const artifactPath = await downloadUpdateArtifact(url, updateArchiveDestination);
    const artifactPath = '/Users/susmitha/code/boundary-ui/ui/desktop/electron-app/updateArchive/boundary_1.0.3_darwin_amd64.zip';
    const configPath = createUpdateConfig(
      artifactPath,
      updateArchiveDestination
    );
    console.log('setFeedURL: ', `file://${configPath}`);
    autoUpdater.setFeedURL(`file://${configPath}`);

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.',
      };
    
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
      });
    })

    autoUpdater.on('error', message => {
      console.error('There was a problem updating the application');
      console.error(message);
    });

    autoUpdater.checkForUpdates();
  },
};
