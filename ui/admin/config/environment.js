/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

'use strict';

const features = require('./features');

const APP_NAME = process.env.APP_NAME || 'Boundary';
const API_HOST = process.env.API_HOST || '';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'admin',
    environment,
    rootURL: '/',
    locationType: 'history',
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
        'host-catalog.aws.region': '/dynamic-host-catalogs-on-aws-region',
        'host-set': '/host-sets',
        'host-set.new': '/host-sets/new',
        'host-set.add-hosts': '/host-sets/add-hosts',
        'host-set.preferred-endpoints': '/host-sets/preferred-endpoints',
        'host-set.sync-interval-seconds': '/host-sets/sync-interval-seconds',
        'credential-store': '/credential-stores',
        'credential-library': '/credential-libraries',
        credential: '/credentials',
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
        'getting-started.desktop': '/getting-started/desktop',
        'api-client.cli': '/api-client/cli',
        'api-client.api': '/api-client/api',
        worker: '/workers',
        'worker.manage-workers': '/workers/manage-workers-on-hcp',
        'worker-filters': '/worker-filters',
      },
    },

    'ember-cli-mirage': {
      directory: '../../addons/api/mirage',
    },

    flashMessageDefaults: {
      timeout: 4000,
    },

    selectedEdition: features.selectedEdition,
    featureEditions: features.featureEditions,
    featureFlags: {},
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV['ember-cli-mirage'].enabled = process.env.ENABLE_MIRAGE
      ? JSON.parse(process.env.ENABLE_MIRAGE)
      : true;

    ENV['ember-a11y-testing'] = {
      componentOptions: {
        axeOptions: {
          checks: {
            'color-contrast': { options: { noScroll: true } },
          },
        },
      },
    };

    // Default edition in development
    ENV.selectedEdition = 'enterprise';
    features.enableFeaturesInAllEditions(
      {
        // Show edition toggle in UI in development
        'dev-edition-toggle': true,
      },
      ENV
    );
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

    ENV.enableConfirmService = false;

    /**
     * Enable additional features for testing purposes.
     * [TODO] Tests should be refactored such that each test case
     * explicitly enables the features and/or edition that it needs.
     * By default, tests should have no features enabled.  This explicit
     * approach ensures that test cases are easy to read and understand,
     * since their feature requirements are embedded.
     */
    ENV.selectedEdition = 'enterprise';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
