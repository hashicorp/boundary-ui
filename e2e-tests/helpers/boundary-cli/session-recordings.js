/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Waits for a session recording to be available
 * @param {string} storageBucketId ID of storage bucket that the session recording is associated with
 * @returns An object representing a session recording
 */
export async function waitForSessionRecording(storageBucketId) {
  let i = 0;
  let filteredSessionRecording = [];
  do {
    i = i + 1;
    const sessionRecordings = JSON.parse(
      execSync('boundary session-recordings list --recursive -format json'),
    );
    filteredSessionRecording = sessionRecordings.items.filter(
      (obj) =>
        obj.storage_bucket_id == storageBucketId && obj.state == 'available',
    );
    if (filteredSessionRecording.length > 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (i < 5);

  return filteredSessionRecording[0];
}
