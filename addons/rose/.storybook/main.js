const namedBlockPolyfill = require('ember-named-blocks-polyfill/lib/named-blocks-polyfill-plugin');

module.exports = {
  stories: [
    '../addon/components/**/*.stories.@(js|mdx)',
    '../stories/**/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-actions',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  emberOptions: {
    polyfills: [namedBlockPolyfill],
  },
  features: {
    postcss: false,
  },
};
