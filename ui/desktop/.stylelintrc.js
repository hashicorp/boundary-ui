/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  rules: {
    'max-nesting-depth': 4,
    'selector-max-compound-selectors': 4,
    'scss/at-extend-no-missing-placeholder': null,
    'function-parentheses-space-inside': null,
    'property-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    // This is often limited by the DOM and we want to order our declarations by our own standard
    'no-descending-specificity': null,
    // As a team we want to stick to using kebab-case as our keyframe name pattern, but there are some exceptions
    // in which we use keyframes from addons like ember-notify, HDS or other in which they use other naming style.
    // This regex checks for these patterns and won't fail.
    'keyframes-name-pattern': [
      '(hds-)|(ember-notify-)|(^gradient)|(^fadeBackground)',
      {
        message: (name) => `Expected Keyframe name "${name}" to be kebab-case`,
      },
    ],
  },
};
