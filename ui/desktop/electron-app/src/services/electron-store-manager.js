/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const Store = require('electron-store');
const log = require('electron-log/main');

// Set the default log level to info when initiating the store
const store = new Store({ defaults: { logLevel: 'info' } });

// Set a handler to watch any changes in log level
store.onDidChange('logLevel', (newValue) => {
  if (newValue) {
    log.transports.file.level = newValue;
  }
});

// Singleton for electron store
module.exports = store;
