'use strict';

const APP_NAME = process.env.APP_NAME || 'Boundary';
const API_HOST = process.env.API_HOST || '';
const EDITION = process.env.EDITION || 'oss'; // Default edition is OSS

// Object that defines edition features.
const featureEditions = {
  oss: {
    'primary-auth-method': true,
    oidc: true,
    'oidc-crud': true,
    'oidc-account-crud': true,
    search: false,
    filter: true,
    'managed-groups': true,
    'static-credentials': false,
  },
};
featureEditions.enterprise = {
  ...featureEditions.oss,
  'ssh-target': false,
};

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'admin',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: false,
      /*{
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }*/
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    api: {
      host: API_HOST,
      namespace: 'v1',
    },

    appName: APP_NAME,
    companyName: 'HashiCorp',

    notifyTimeout: 4000,
    sessionPollingTimeoutSeconds: 300,
    oidcPollingTimeoutSeconds: 1,

    documentation: {
      baseURL: 'https://boundaryproject.io/help/admin-ui',
      topics: {
        org: '/orgs',
        'org.new': '/orgs/new',
        project: '/projects',
        'project.new': '/projects/new',
        account: '/accounts',
        'account.new': '/accounts/new',
        'auth-method': '/auth-methods',
        'managed-groups': '/managed-groups',
        group: '/groups',
        'group.add-members': '/groups/add-members',
        'host-catalog': '/host-catalogs',
        'host-catalog.new': '/host-catalogs/new',
        'host-catalog.azure': '/dynamic-host-catalogs-on-azure',
        'host-catalog.aws': '/dynamic-host-catalogs-on-aws',
        'host-set': '/host-sets',
        'host-set.new': '/host-sets/new',
        'host-set.add-hosts': '/host-sets/add-hosts',
        'credential-store': '/credential-stores',
        'credential-library': '/credential-libraries',
        host: '/hosts',
        'host.new': '/hosts/new',
        role: '/roles',
        'role.add-principals': '/roles/add-principals',
        session: '/sessions',
        target: '/targets',
        'target.new': '/targets/new',
        'target.add-host-sources': '/targets/add-host-sets',
        'target.worker-filters': '/targets/worker-filters',
        user: '/users',
        downloads: '/downloads',
        'getting-started.desktop': '/gettting-started/desktop',
        'api-client.cli': '/api-client/cli',
        'api-client.api': '/api-client/api',
      },
    },

    'ember-cli-mirage': {
      directory: '../../addons/api/mirage',
    },

    featureFlags: featureEditions[EDITION],
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV['ember-a11y-testing'] = {
      componentOptions: {
        axeOptions: {
          checks: {
            'color-contrast': { options: { noScroll: true } },
          },
        },
      },
    };

    // Enable features in development
    ENV.featureFlags['ssh-target'] = false;
    ENV.featureFlags['static-credentials'] = true;
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

    // Enable tests for development features
    ENV.featureFlags['ssh-target'] = true;
    ENV.featureFlags['static-credentials'] = true;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
