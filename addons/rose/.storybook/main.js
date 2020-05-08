module.exports = {
  stories: [
    '../addon/components/**/*.stories.(js|mdx)',
    '../stories/**/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-actions',
    '@storybook/addon-docs',
  ]
};
