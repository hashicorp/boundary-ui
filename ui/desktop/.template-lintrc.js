/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-passed-in-event-handlers': false,
    'no-bare-strings': true,
    'no-curly-component-invocation': { allow: ['app-name'] },
    'no-implicit-this': { allow: ['app-name', 'is-loading'] },
  },
  overrides: [
    {
      files: '**/tests/**/*.{js,gts,gjs}',
      rules: {
        prettier: false,
      },
    },
  ],
};
