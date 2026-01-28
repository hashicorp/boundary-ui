/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  rules: {
    // We oftentimes want to have long form properties for readability
    'declaration-block-no-redundant-longhand-properties': null,

    // This is just a personal preference unless the quotes are needed
    // to escape special characters
    'function-url-quotes': null,

    // This is often limited by the DOM and we want to order our declarations by our own standard
    'no-descending-specificity': null,

    // -Webkit animation CSS for older browsers.  Need a decision to remove `-webkit` syntax in
    // favor of normal CSS
    'property-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,

    // As a team we want to stick to using kebab-case as our selector class pattern, but there are a couple
    // of exceptions in which we overrride CSS from addons like CodeMirror and HDS, in which they use
    // pascal case and a double-kebab-case. This regex checks for all of those 3 patterns and won't fail
    // lint check, but will fail if its any other pattern.
    'selector-class-pattern': [
      '(^([a-z][a-z0-9]*)(-{1,2}[a-z0-9]+)*$)|(^CodeMirror)',
      {
        message: (selector) =>
          `Expected class selector "${selector}" to be kebab-case`,
      },
    ],
  },
};
