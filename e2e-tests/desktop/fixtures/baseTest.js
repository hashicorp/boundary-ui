/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { mergeTests } from '@playwright/test';
import { electronTest } from './electronTest.js';
import { authenticateTest } from './authenticateTest.js';
import { test as envTest } from '../../global-setup.js';
import { tesseractTest } from './tesseractTest.js';

// The last item in the list will override any previous ones in a fixture name collision
export const test = mergeTests(
  envTest,
  authenticateTest,
  electronTest,
  tesseractTest,
);
export { expect } from '@playwright/test';
