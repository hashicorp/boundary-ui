/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { defineConfig, globalIgnores } from 'eslint/config';
import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // This is specific babel-config. If grows consider creating a babel config file
        requireConfigFile: false,
        // end of babel-config
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      curly: ['error', 'multi-line', 'consistent'],
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
    },
  },

  // Playwright test files
  {
    files: ['admin/tests/**', 'desktop/tests/**'],
    extends: [playwright.configs['flat/recommended']],
  },

  // Prettier should be last
  eslintConfigPrettier,
  globalIgnores(['admin/artifacts', 'desktop/artifacts', 'playwright-report']),
]);
