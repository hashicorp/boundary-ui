/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // This is specific babel-config. If grows consider creating a babel config file
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
    // end of babel-config
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
  },
  overrides: [
    // node files
    {
      files: ['./.eslintrc.js', './.prettierrc.js'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // e2e files
      files: ['admin/**', 'desktop/**', 'helpers/**'],
      env: {
        node: true,
      },
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        'no-empty-pattern': [
          'error',
          { allowObjectPatternsAsParameters: true },
        ],
      },
    },
  ],
};
