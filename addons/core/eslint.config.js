/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

/* eslint-disable n/no-unpublished-require */
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
      '.template-lintrc.js',
      'ember-cli-build.js',
      'index.js',
      'testem.js',
      'blueprints/*/index.js',
      'config/**/*.js',
      'tests/dummy/config/**/*.js',
    ],
    plugins: { n: nPlugin },
    extends: [nPlugin.configs['flat/recommended-script']],
  },

  // Test files configuration
  {
    files: ['tests/**/*-test.{js,ts}'],
    extends: [
      { ...qunitPlugin.configs.recommended, plugins: { qunit: qunitPlugin } },
    ],
    rules: {
      'qunit/require-expect': [2, 'except-simple'],
    },
  },
  // Prettier should be last
  eslintConfigPrettier,
  globalIgnores([
    'blueprints/*/files/',
    'declarations/',
    'dist/',
    'coverage/',
    '**/.*/',
    '.node_modules.ember-try/',
  ]),
]);
