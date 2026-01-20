/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Deletes the specified storage bucket
 * @param {string} storageBucketId ID of the storage bucket to be deleted
 */
export async function deleteStorageBucket(storageBucketId) {
  try {
    execSync('boundary storage-buckets delete -id=' + storageBucketId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}
