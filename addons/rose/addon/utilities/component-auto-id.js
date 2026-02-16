/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * A function that generates a component ID, based on UUID.
 * @return {string}
 */
export function generateComponentID() {
  return `component-${uuidv4()}`;
}
