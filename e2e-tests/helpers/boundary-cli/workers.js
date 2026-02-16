/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new controller-led worker
 * @returns {Promise<string>} new worker's ID
 */
export async function createControllerLedWorker() {
  const workerName = 'worker-' + nanoid();
  let newWorker;
  try {
    newWorker = JSON.parse(
      execSync(
        `boundary workers create controller-led \
        -name="${workerName.toLowerCase()}" \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newWorker.id;
}
