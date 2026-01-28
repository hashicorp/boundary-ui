/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  overrides: [
    {
      files: ['addon/components/rose/anonymous/index.hbs'],
      rules: {
        'no-yield-only': false,
      },
    },
    {
      files: ['addon/components/rose/form/actions/index.hbs'],
      rules: {
        'no-passed-in-event-handlers': false,
      },
    },
    {
      files: '**/tests/**/*.{js,gts,gjs}',
      rules: {
        prettier: false,
      },
    },
  ],
};
