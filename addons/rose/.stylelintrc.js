/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  rules: {
    // This could be fixed in the future if we don't want to use the legacy format
    'color-function-notation': 'legacy',

    // We oftentimes want to have long form properties for readability
    'declaration-block-no-redundant-longhand-properties': null,

    // This is just a personal preference unless the quotes are needed
    // to escape special characters
    'function-url-quotes': null,

    // This is often limited by the DOM and we want to order our declarations by our own standard
    'no-descending-specificity': null,
  },
};
