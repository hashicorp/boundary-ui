/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Creates a new controller-led worker
 * @returns {Promise<string>} new worker's ID
 */
export async function createControllerLedWorkerCli() {
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
