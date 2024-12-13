/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { mergeTests } from '@playwright/test';
import { electronTest } from './electronTest.js';
import { authenticateTest } from './authenticateTest.js';
import { test as envTest } from '../../global-setup.js';

// The last item in the list will override any previous ones in a fixture name collision
export const test = mergeTests(envTest, authenticateTest, electronTest);
export { expect } from '@playwright/test';
