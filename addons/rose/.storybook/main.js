/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const namedBlockPolyfill = require('ember-named-blocks-polyfill/lib/named-blocks-polyfill-plugin');

module.exports = {
  framework: {
    name: '@storybook/ember',
    options: {
      polyfills: [namedBlockPolyfill],
    },
  },
  stories: [
    '../addon/components/**/*.stories.@(js|mdx)',
    '../stories/**/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-controls',
  ],
  features: {
    postcss: false,
  },
};
