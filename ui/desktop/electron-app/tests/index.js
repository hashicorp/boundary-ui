/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const {
  default: installExtension,
  EMBER_INSPECTOR,
} = require('electron-devtools-installer');
const path = require('path');
const { app } = require('electron');
const handleFileUrls = require('../src/handle-file-urls');
const {
  setupTestem,
  openTestWindow,
} = require('ember-electron/lib/test-support');

const emberAppDir = path.resolve(__dirname, '..', 'ember-test');

app.on('ready', async function onReady() {
  try {
    await installExtension(EMBER_INSPECTOR);
  } catch (err) {
    console.log('Failed to install Ember Inspector: ', err);
  }

  await handleFileUrls(emberAppDir);
  setupTestem();
  openTestWindow(emberAppDir);
});

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
