'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['octane', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-bare-strings': true,
    'no-curly-component-invocation': { allow: ['app-name'] },
    'no-implicit-this': { allow: ['app-name', 'is-loading'] },
  },
};
