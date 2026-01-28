/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '@playwright/test';
import { createWorker } from 'tesseract.js';

export const textToMatch =
  /To run a command as administrator|Welcome to OpenSSH Server/;

export const tesseractTest = test.extend({
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
