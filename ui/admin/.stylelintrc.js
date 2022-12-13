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

    // The few overrides for CodeMirror and HDS CSS aren't worth creating full regex expressions to match those
    // style characteristics.
    'selector-class-pattern': null,
  },
};
