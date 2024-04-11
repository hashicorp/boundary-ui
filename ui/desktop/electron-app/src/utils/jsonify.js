/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const log = require('electron-log/main');

// Convert to json
const jsonify = (data) => {
  if (typeof data !== 'string') data = JSON.stringify(data);
  try {
    return JSON.parse(data);
  } catch (e) {
    log.info('Error parsing JSON', e);
    // Ignore parse errors
  }
};

module.exports = jsonify;
