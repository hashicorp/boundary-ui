/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const v8 = require('v8');
const {
  defaultEdition,
  featureEditions,
  licensedFeatures,
} = require('./features');

const APP_NAME = process.env.APP_NAME || 'Boundary';
const API_HOST = process.env.API_HOST || '';

const clone = (obj) => v8.deserialize(v8.serialize(obj));

module.exports = function (environment) {
  // Start with a fresh copy of the features config every run, since it
  // could be modified by an environment.
  const features = {
    defaultEdition,
    featureEditions: clone(featureEditions),
    licensedFeatures: clone(licensedFeatures),
  };

  let ENV = {
    modulePrefix: 'admin',
    environment,
    rootURL: '/',
    locationType: 'history',
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

    api: {
      host: API_HOST,
      namespace: 'v1',
    },

    appName: APP_NAME,
    companyName: 'HashiCorp',

    sessionPollingTimeoutSeconds: 300,
    oidcPollingTimeoutSeconds: 1,

    documentation: {
      baseURL: 'https://developer.hashicorp.com',
      topics: {
        global: '/boundary/docs/concepts/domain-model/scopes#global',
        org: '/boundary/docs/concepts/domain-model/scopes#organizations',
        'org.new': '/boundary/docs/common-workflows/manage-scopes',
        project: '/boundary/docs/concepts/domain-model/scopes#projects',
        'project.new': '/boundary/docs/common-workflows/manage-scopes',
        account: '/boundary/docs/concepts/domain-model/accounts',
        'account.new':
          '/boundary/tutorials/oss-administration/oss-manage-users-groups#create-an-account',
        'auth-method': '/boundary/docs/concepts/domain-model/auth-methods',
        'managed-groups': '/boundary/docs/concepts/domain-model/managed-groups',
        group: '/boundary/docs/concepts/domain-model/groups',
        'group.add-members':
          '/boundary/tutorials/oss-administration/oss-manage-users-groups#create-a-group',
        'host-catalog': '/boundary/docs/concepts/domain-model/host-catalogs',
        'host-catalog.new': '/boundary/docs/common-workflows/manage-targets',
        'host-catalog.azure': '/boundary/docs/concepts/host-discovery/azure',
        'host-catalog.aws': '/boundary/docs/concepts/host-discovery/aws',
        'host-catalog.aws.region':
          'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html',
        'host-set': '/boundary/docs/concepts/domain-model/host-sets',
        'host-set.new':
          '/boundary/docs/common-workflows/manage-targets#define-a-host-set',
        'host-set.add-hosts': '/boundary/docs/concepts/domain-model/hosts',
        'host-set.preferred-endpoints':
          '/boundary/docs/concepts/domain-model/host-sets#preferred_endpoints',
        'host-set.sync-interval-seconds':
          '/boundary/docs/concepts/domain-model/host-sets#sync_interval_seconds',
        'credential-store':
          '/boundary/docs/concepts/domain-model/credential-stores',
        'credential-library':
          '/boundary/docs/concepts/domain-model/credential-libraries',
        credential: '/boundary/docs/concepts/domain-model/credentials',
        host: '/boundary/docs/concepts/domain-model/hosts',
        'host.new':
          '/boundary/docs/common-workflows/manage-targets#define-a-host',
        role: '/boundary/docs/concepts/domain-model/roles',
        'role.add-principals':
          '/boundary/tutorials/oss-administration/oss-manage-roles#create-a-role',
        session: '/boundary/docs/concepts/domain-model/sessions',
        target: '/boundary/docs/concepts/domain-model/targets',
        'target.new': '/boundary/docs/common-workflows/manage-targets',
        'target.add-host-sources':
          '/boundary/docs/concepts/domain-model/host-sets',
        'target.enable-session-recording':
          '/boundary/docs/configuration/session-recording/enable-session-recording',
        'target.worker-filters':
          '/boundary/docs/concepts/filtering/worker-tags#worker-filtering',
        user: '/boundary/docs/concepts/domain-model/users',
        downloads: '/boundary/install',
        'getting-started.desktop':
          '/boundary/tutorials/oss-getting-started/oss-getting-started-desktop-app',
        'api-client.cli': '/boundary/docs/commands',
        'api-client.api': '/boundary/docs/api-clients/api',
        worker: '/boundary/docs/configuration/worker',
        'worker.manage-workers':
          '/boundary/tutorials/hcp-administration/hcp-manage-workers',
        'worker-filters':
          '/boundary/docs/concepts/domain-model/credential-stores#worker_filter',
        'storage-bucket':
          '/boundary/docs/concepts/domain-model/storage-buckets',
        'storage-bucket.new':
          '/boundary/docs/configuration/session-recording/create-storage-bucket',
        'storage-bucket.worker-filter':
          '/boundary/docs/concepts/domain-model/storage-buckets#worker_filter',
        'storage-bucket.disable-credential-rotation':
          '/boundary/docs/concepts/domain-model/storage-buckets#disable_credential_rotation',
        'session-recording':
          '/boundary/docs/concepts/domain-model/session-recordings',
        'session-recording.retrieve-lost-session-recordings':
          '/boundary/docs/operations/manage-recorded-sessions',
        'storage-policy': '/boundary/docs/concepts/domain-model/storage-policy',
        'storage-policy.new':
          '/boundary/docs/configuration/session-recording/configure-storage-policy',
        'storage-policy.update':
          '/boundary/docs/configuration/session-recording/update-storage-policy',
        alias: '/boundary/docs/concepts/aliases',
      },
    },

    'ember-cli-mirage': {
      directory: '../../addons/api/mirage',
    },

    flashMessageDefaults: {
      timeout: 4000,
    },

    features: features,
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
    ENV.features.defaultEdition = 'enterprise';
    // Enable development-only features
    ENV.features.featureEditions.oss['dev-edition-toggle'] = true;
    ENV.features.featureEditions.enterprise['dev-edition-toggle'] = true;
    ENV.features.featureEditions.hcp['dev-edition-toggle'] = true;
    // Enable licensed features by default in enterprise and hcp
    Object.keys(ENV.features.licensedFeatures).forEach((feature) => {
      ENV.features.featureEditions.enterprise[feature] = true;
      ENV.features.featureEditions.hcp[feature] = true;
    });
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
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
