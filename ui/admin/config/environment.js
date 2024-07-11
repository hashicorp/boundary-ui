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
      baseURL: 'https://developer.hashicorp.com/boundary',
      topics: {
        global: '/docs/concepts/domain-model/scopes#global',
        org: '/docs/concepts/domain-model/scopes#organizations',
        'org.new': '/docs/common-workflows/manage-scopes',
        project: '/docs/concepts/domain-model/scopes#projects',
        'project.new': '/docs/common-workflows/manage-scopes',
        account: '/docs/concepts/domain-model/accounts',
        'account.new':
          '/tutorials/oss-administration/oss-manage-users-groups#create-an-account',
        'auth-method': '/docs/concepts/domain-model/auth-methods',
        'managed-groups': '/docs/concepts/domain-model/managed-groups',
        group: '/docs/concepts/domain-model/groups',
        'group.add-members':
          '/tutorials/oss-administration/oss-manage-users-groups#create-a-group',
        'host-catalog': '/docs/concepts/domain-model/host-catalogs',
        'host-catalog.new': '/docs/common-workflows/manage-targets',
        'host-catalog.azure': '/docs/concepts/host-discovery/azure',
        'host-catalog.aws': '/docs/concepts/host-discovery/aws',
        'host-catalog.aws.region':
          'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html',
        'host-set': '/docs/concepts/domain-model/host-sets',
        'host-set.new':
          '/docs/common-workflows/manage-targets#define-a-host-set',
        'host-set.add-hosts': '/docs/concepts/domain-model/hosts',
        'host-set.preferred-endpoints':
          '/docs/concepts/domain-model/host-sets#preferred_endpoints',
        'host-set.sync-interval-seconds':
          '/docs/concepts/domain-model/host-sets#sync_interval_seconds',
        'credential-store': '/docs/concepts/domain-model/credential-stores',
        'credential-library':
          '/docs/concepts/domain-model/credential-libraries',
        credential: '/docs/concepts/domain-model/credentials',
        host: '/docs/concepts/domain-model/hosts',
        'host.new': '/docs/common-workflows/manage-targets#define-a-host',
        role: '/docs/concepts/domain-model/roles',
        'role.add-principals':
          '/tutorials/oss-administration/oss-manage-roles#create-a-role',
        session: '/docs/concepts/domain-model/sessions',
        target: '/docs/concepts/domain-model/targets',
        'target.new': '/docs/common-workflows/manage-targets',
        'target.add-host-sources': '/docs/concepts/domain-model/host-sets',
        'target.enable-session-recording':
          '/docs/configuration/session-recording/enable-session-recording',
        'target.worker-filters':
          '/docs/concepts/filtering/worker-tags#worker-filtering',
        user: '/docs/concepts/domain-model/users',
        downloads: '/install',
        'getting-started.desktop':
          '/tutorials/oss-getting-started/oss-getting-started-desktop-app',
        'api-client.cli': '/docs/commands',
        'api-client.api': '/docs/api-clients/api',
        worker: '/docs/configuration/worker',
        'worker.manage-workers':
          '/tutorials/hcp-administration/hcp-manage-workers',
        'worker-filters':
          '/docs/concepts/domain-model/credential-stores#worker_filter',
        'storage-bucket': '/docs/concepts/domain-model/storage-buckets',
        'storage-bucket.new':
          '/docs/configuration/session-recording/create-storage-bucket',
        'storage-bucket.worker-filter':
          '/docs/concepts/domain-model/storage-buckets#worker_filter',
        'storage-bucket.disable-credential-rotation':
          '/docs/concepts/domain-model/storage-buckets#disable_credential_rotation',
        'session-recording': '/docs/concepts/domain-model/session-recordings',
        'session-recording.retrieve-lost-session-recordings':
          '/docs/operations/manage-recorded-sessions',
        'storage-policy': '/docs/concepts/domain-model/storage-policy',
        'storage-policy.new':
          '/docs/configuration/session-recording/configure-storage-policy',
        'storage-policy.update':
          '/docs/configuration/session-recording/update-storage-policy',
        aliases: '/aliases',
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
