'use strict';

const APP_NAME = process.env.APP_NAME || 'Boundary';
const API_HOST = process.env.API_HOST || '';
const EDITION = process.env.EDITION || 'oss'; // Default edition is OSS.

const featureEditions = {
  oss: {
    'primary-auth-method': true,
    oidc: true,
    'oidc-crud': true,
    'oidc-account-crud': true,
    search: false,
    filter: true,
    'credential-store': true,
    'managed-groups': true,
  },
  enterprise: {
    'ssh-target': true,
  },
};
/**
 *  Return the featureFlag correspondant to the defined EDITION. By default OSS
 * @returns {object} FeaturesFlag object
 */
const getFeaturesEditionObject = () => {
  if (EDITION === 'enterprise') {
    return { ...featureEditions.oss, ...featureEditions.enterprise };
  }
  return featureEditions.oss;
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
    sessionPollingTimeoutSeconds: 2.5,
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
        user: '/users',
      },
    },

    contentSecurityPolicyHeader: 'Content-Security-Policy',
    contentSecurityPolicyMeta: true,
    contentSecurityPolicy: {
      'default-src': ["'none'"],
      'script-src': ["'self'"],
      'frame-src': ["'self'"],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'style-src': ["'self'"],
      'media-src': ["'self'"],
      'manifest-src': ["'self'"],
    },

    'ember-cli-mirage': {
      directory: '../../addons/api/mirage',
    },

    featureFlags: getFeaturesEditionObject(),
  };

  // Unsafe policy is necessary in development and test environments, but should
  // not be used in production.
  const enableUnsafeCSP = () => {
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-eval'");
    ENV.contentSecurityPolicy['style-src'].push("'unsafe-inline'");
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

    enableUnsafeCSP();
    // TODO: should provide an env var to explicitly add a host to CSP
    // at build time for any environment (not just development),
    // rather than automatically include API_HOST.  Changes to CSP should
    // be explicit.
    if (API_HOST) ENV.contentSecurityPolicy['connect-src'].push(API_HOST);

    // Enable features in development
    // ENV.featureFlags['ssh-target'] = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    // CSP breaks test coverage, so it is disabled in this environment
    ENV.contentSecurityPolicyMeta = false;

    // Notification timeout should be 0 for fast tests
    ENV.notifyTimeout = 0;
    ENV.enableConfirmService = false;

    // Enable tests for development features
    // ENV.featureFlags['ssh-target'] = true;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }
  return ENV;
};
