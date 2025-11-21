/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const APP_NAME = process.env.APP_NAME || 'Boundary';
const locationType = process.env.EMBER_CLI_ELECTRON ? 'hash' : 'history';
const ENABLE_A11Y_AUDIT = process.env.ENABLE_A11Y_AUDIT || false;
const COLOR_THEME = process.env.COLOR_THEME ?? 'light';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'desktop',
    environment,
    rootURL: process.env.EMBER_CLI_ELECTRON ? '' : '/',
    locationType,
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    isElectron: process.env.EMBER_CLI_ELECTRON
      ? JSON.parse(process.env.EMBER_CLI_ELECTRON)
      : false,

    api: {
      // there is no default API host in desktop
      //host: API_HOST,
      namespace: 'v1',
    },

    appName: APP_NAME,

    oidcPollingTimeoutSeconds: 1,
    sessionPollingTimeoutSeconds: 2,

    documentation: {
      baseURL: 'https://developer.hashicorp.com/boundary',
      topics: {
        targets:
          '/tutorials/oss-getting-started/oss-getting-started-desktop-app#connect',
        sessions:
          '/tutorials/oss-getting-started/oss-getting-started-desktop-app#connect',
        'support-page': 'https://support.hashicorp.com/hc/en-us',
      },
    },

    flashMessageDefaults: {
      timeout: 4000,
    },

    featureFlags: {},
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    // This flag tells the origin route to autoset the controller origin field
    // of the UI, which only makes sense in development where the origin is
    // usually the same as the application origin.
    ENV.autoOrigin = true;

    ENV.mirage = {
      enabled: process.env.ENABLE_MIRAGE
        ? JSON.parse(process.env.ENABLE_MIRAGE)
        : true,
    };

    ENV.ENABLE_A11Y_AUDIT = ENABLE_A11Y_AUDIT;
    ENV.COLOR_THEME = COLOR_THEME;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    // Notification timeout should be 0 for fast tests
    ENV.flashMessageDefaults.timeout = 0;
    // OIDC Authentication timeout should be 0 for fast tests
    ENV.oidcPollingTimeoutSeconds = 0;
    // Sessions polling timeout should be 0 for fast tests
    ENV.sessionPollingTimeoutSeconds = 0;

    ENV.enableConfirmService = false;

    // Use in-memory storage
    ENV.storage = {
      memory: true,
    };

    ENV.ENABLE_A11Y_AUDIT = ENABLE_A11Y_AUDIT;
    ENV.COLOR_THEME = COLOR_THEME;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
