/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '@playwright/test';
import { createWorker } from 'tesseract.js';

export const tesseractTest = test.extend({
  textToSearch: ({}, use) => {
    use('To run a command as administrator');
  },
  tesseract: [
    async ({}, use) => {
      const worker = await createWorker('eng', 1, {
        cachePath: './artifacts',
      });
      await use(worker);
      await worker.terminate();
    },
    { scope: 'worker' },
  ],
});