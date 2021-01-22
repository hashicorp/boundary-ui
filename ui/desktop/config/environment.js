'use strict';

const APP_NAME = process.env.APP_NAME || 'Boundary';
const ENABLE_MIRAGE = ('ENABLE_MIRAGE' in process.env) ? process.env.ENABLE_MIRAGE : false;

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'desktop',
    environment,
    rootURL: process.env.EMBER_CLI_ELECTRON ? '' : '/',
    locationType: process.env.EMBER_CLI_ELECTRON ? 'hash' : 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: false,
      // EXTEND_PROTOTYPES: {
      //   // Prevent Ember Data from overriding Date.parse.
      //   Date: false
      // }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    isElectron: Boolean(process.env.EMBER_CLI_ELECTRON),

    'ember-cli-mirage': {
      enabled: ENABLE_MIRAGE,
      directory: '../../addons/api/mirage'
    },

    api: {
      // there is no default API host in desktop
      //host: API_HOST,
      namespace: 'v1',
    },

    appName: APP_NAME,

    notifyTimeout: 4000,
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
    ENV.notifyTimeout = 0;
    
    ENV.enableConfirmService = false;

    // Use in-memory storage
    ENV.storage = {
      memory: true
    };
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
