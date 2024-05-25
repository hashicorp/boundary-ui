/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
const jsonify = require('./jsonify');

// Convert to json
const generateErrorPromise = async (stderr) => {
  const parsedResponse = jsonify(stderr);

  if (parsedResponse?.status_code) {
    return Promise.reject({
      statusCode: parsedResponse?.status_code,
      error: parsedResponse?.api_error,
    });
  }

  return Promise.reject({
    error: parsedResponse?.error,
  });
};

module.exports = generateErrorPromise;
