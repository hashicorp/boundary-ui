/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const API_HOST = process.env.API_HOST || '';

module.exports = function (environment) {
  let policy = {
    // Deny everything by default
    'default-src': ["'none'"],
    'script-src': ["'self'"],
    'frame-src': ["'self'"],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'img-src': ["'self'", 'data:'],
    'style-src': ["'self'"],
    'media-src': ["'self'"],
    'manifest-src': ["'self'"],
    'style-src-attr': ["'self'"],
  };

  // Unsafe policy is necessary in development and test environments, but should
  // not be used in production.
  if (environment === 'development') {
    policy['script-src'].push("'unsafe-eval'");
    policy['style-src'].push("'unsafe-inline'");
    if (API_HOST) policy['connect-src'].push(API_HOST);
  }

  //enable csp meta tag only in dev env
  return {
    delivery: ['meta'],
    enabled: environment === 'development',
    policy,
    reportOnly: false,
  };
};
