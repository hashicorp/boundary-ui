/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { v1 } from 'ember-uuid';

/**
 * A function that generates a component ID, based on UUID.
 * @return {string}
 */
export function generateComponentID() {
  return `component-${v1()}`;
}
