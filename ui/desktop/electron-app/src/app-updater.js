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
    const updateVersion = '1.0.0';
    const url = `${releasesUrl}/${updateVersion}/boundary_${updateVersion}_darwin_amd64.zip`;
    const artifactPath = await downloadUpdateArtifact(url, updateArchiveDestination);
    const feedURL = createUpdateConfig(artifactPath, updateArchiveDestination);
    autoUpdater.setFeedURL(feedURL);
    autoUpdater.checkForUpdates();
  },
};
