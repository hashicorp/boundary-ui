/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const runtimeSettings = require('../services/runtime-settings.js');
const isDev = require('electron-is-dev');

const csp = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'frame-src': ["'self'"],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'style-src': ["'self'"],
  'media-src': ["'self'"],
  'manifest-src': ["'self'"],
  'frame-ancestors': ["'self'"],
};

// Dev policy is necessary for Ember live reload.
// Unsafe policy is necessary in development and test environments, but should
// not be used in production.
const enableDevCSP = () => {
  csp['style-src'].push("'unsafe-inline'");
  csp['script-src'].push("'unsafe-eval'");
  csp['script-src'].push("'unsafe-inline'");
  csp['script-src'].push('http://localhost:8000');
  csp['connect-src'].push('ws://localhost:8000');
};

const generateCSPHeader = () => {
  const policy = Object.assign({}, csp);

  // If a clusterUrl is specified, add it to the connect-src directive
  if (runtimeSettings.clusterUrl) {
    policy['connect-src'] = policy['connect-src'].slice();
    policy['connect-src'].push(runtimeSettings.clusterUrl);
  }

  // add hashicorp release endpoints to connect-src
  policy['connect-src'].push('https://api.releases.hashicorp.com');
  policy['connect-src'].push('https://releases.hashicorp.com');

  return Object.keys(policy)
    .map((key) => `${key} ${policy[key].join(' ')};`)
    .join(' ');
};

if (isDev) enableDevCSP();

module.exports = {
  generateCSPHeader: generateCSPHeader,
};
