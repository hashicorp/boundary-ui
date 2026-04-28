/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Stops the boundary cache used by the desktop client
 */
export async function stopCache() {
  try {
    execSync('boundary cache stop');
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}
