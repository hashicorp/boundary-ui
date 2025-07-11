/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  singleQuote: true,
  printWidth: 80,
  plugins: ['prettier-plugin-ember-template-tag'],

  overrides: [
    {
      files: '*.{js,ts,gjs,gts}',
      options: {
        singleQuote: true,
      },
    },
  ],
};
