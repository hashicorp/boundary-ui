/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // This is specific babel-config. If grows consider creating a babel config file
    requireConfigFile: false,
    // end of babel-config
  },
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {
    curly: ['error', 'multi-line', 'consistent'],
    'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
  },
  overrides: [
    {
      "files": ["admin/tests/**", "desktop/tests/**"],
      "extends": "plugin:playwright/recommended"
    }
  ]
};
