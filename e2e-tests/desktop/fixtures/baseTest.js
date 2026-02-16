/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { mergeTests } from '@playwright/test';
import { electronTest } from './electronTest.js';
import { authenticateTest } from './authenticateTest.js';
import { test as envTest } from '../../global-setup.js';
import { tesseractTest } from './tesseractTest.js';

// Note that if there are any fields that have name conflicts in the fixtures,
// fixtures that appear later in this list will override any fields that appear earlier.
export const test = mergeTests(
  envTest,
  authenticateTest,
  electronTest,
  tesseractTest,
);
export { expect } from '@playwright/test';
