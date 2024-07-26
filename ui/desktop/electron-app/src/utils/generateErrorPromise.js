/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
const jsonify = require('./jsonify');
const log = require('electron-log/main');

// Convert to json
const generateErrorPromise = async (stderr) => {
  const parsedResponse = jsonify(stderr);

  if (parsedResponse?.status_code) {
    return Promise.reject({
      statusCode: parsedResponse?.status_code,
      message: parsedResponse?.api_error,
    });
  }

  return Promise.reject({
    message: parsedResponse?.error,
  });
};

module.exports = generateErrorPromise;
