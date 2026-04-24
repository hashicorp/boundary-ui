/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import * as boundaryCli from '../helpers/boundary-cli.js';
import baseGlobalSetup from '../global-setup.js';

export default async function globalSetup() {
  await baseGlobalSetup();

  // when running locally, there's a chance that the cache could be running an
  // older version.
  // stop the cache if it's running, and the desktop client will automatically
  // start the cache after logging in .
  await boundaryCli.checkBoundaryCli();
  await boundaryCli.stopCache();
}
