'use strict';

module.exports = {
  extends: ['recommended'],

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
    quotes: 'single',
  },
};
