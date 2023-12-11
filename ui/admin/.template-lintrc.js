'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-passed-in-event-handlers': false,
    'no-bare-strings': true,
    'no-curly-component-invocation': {
      allow: ['app-name', 'company-name', 'company-copyright'],
    },
    'no-implicit-this': {
      allow: [
        'app-name',
        'company-name',
        'company-copyright',
        'doc-url',
        'is-loading',
      ],
    },
    'no-route-action': false,
  },
  overrides: [
    {
      files: '**/tests/**/*.{js,gts,gjs}',
      rules: {
        prettier: false,
      },
    },
    // Temporarily disabling prettier plugin for ember templates due to bug: https://github.com/ember-template-lint/ember-template-lint-plugin-prettier/issues/268
    {
      files: ['**/*.{gjs,gts}'],
      rules: {
        prettier: false,
      },
    },
  ],
};
