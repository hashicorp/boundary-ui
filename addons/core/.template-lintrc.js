/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-curly-component-invocation': {
      allow: ['app-name', 'company-name', 'company-copyright'],
    },
  },
  // test
  overrides: [
    {
      files: ['tests/**/*-test.js'],
      rules: {
        'no-unused-block-params': false,
      },
    },
  ],
};
