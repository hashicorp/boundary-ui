/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const { defineConfig, globalIgnores } = require('eslint/config');
const babelParser = require('@babel/eslint-parser');
const js = require('@eslint/js');
const eslintPluginEmberRecommended = require('eslint-plugin-ember/configs/recommended');
const nPlugin = require('eslint-plugin-n');
const qunitPlugin = require('eslint-plugin-qunit');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  js.configs.recommended,
  ...eslintPluginEmberRecommended,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        requireConfigFile: false,
        // This is specific babel-config. If it grows consider creating a babel config file
        babelOptions: {
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              { decoratorsBeforeExport: true },
            ],
          ],
        },
        // end of babel-config
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      curly: ['error', 'multi-line', 'consistent'],
      'ember/no-get': 'off',
      'ember/no-get-with-default': 'off',
      'ember/no-computed-properties-in-native-classes': 'off',
      'ember/no-assignment-of-untracked-properties-used-in-tracking-contexts':
        'off',
    },
  },

  // Node files configuration
  {
    files: [
      'eslint.config.js',
      '.prettierrc.js',
      '.stylelintrc.js',
      '.template-lintrc.js',
      'ember-cli-build.js',
      'testem.js',
      'testem-electron.js',
      'playwright.config.js',
      'config/**/*.js',
      'electron-app/**/*.js',
    ],
    plugins: { n: nPlugin },
    extends: [nPlugin.configs['flat/recommended-script']],
  },

  // Test files configuration
  {
    files: ['tests/**/*-test.{js,ts}'],
    plugins: {
      qunit: qunitPlugin,
    },
    rules: {
      ...qunitPlugin.configs.recommended.rules,
      'qunit/require-expect': [2, 'except-simple'],
    },
  },
  // Prettier should be last
  eslintConfigPrettier,
  globalIgnores([
    'declarations/',
    'dist/',
    'coverage/',
    '**/.*/',
    '.node_modules.ember-try/',
    'electron-app/out/',
    'electron-app/ember-dist/',
  ]),
]);
