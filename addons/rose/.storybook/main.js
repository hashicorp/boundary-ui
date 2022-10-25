const namedBlockPolyfill = require('ember-named-blocks-polyfill/lib/named-blocks-polyfill-plugin');

module.exports = {
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
  emberOptions: {
    polyfills: [namedBlockPolyfill],
  },
  features: {
    postcss: false,
  },
};
