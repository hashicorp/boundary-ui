/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  overrides: [
    {
      files: [
        'addon/components/rose/anonymous/index.hbs',
        'addon/components/rose/table/row/cell/index.hbs',
        'addon/components/rose/anonymous/index.hbs',
      ],
      rules: {
        'no-yield-only': false,
      },
    },
    {
      files: ['addon/components/rose/dialog/index.hbs'],
      rules: {
        'no-duplicate-landmark-elements': false,
      },
    },
    {
      files: ['addon/components/rose/form/actions/index.hbs'],
      rules: {
        'no-passed-in-event-handlers': false,
      },
    },
  ],
};
