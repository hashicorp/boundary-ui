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
  },
  overrides: [
    {
      files: '**/*.{js,gts,gjs}',
      rules: {
        prettier: false,
      },
    },
  ],
};
