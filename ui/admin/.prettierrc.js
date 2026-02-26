/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  plugins: ['prettier-plugin-ember-template-tag'],
  singleQuote: true,
  printWidth: 80,
  overrides: [
    {
      files: '*.{js,ts,gjs,gts}',
      options: {
        singleQuote: true,
      },
    },
  ],
};
