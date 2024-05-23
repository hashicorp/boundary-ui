/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * Helper to convert json object to string for display purposes.
 */
export default helper(function rawJson([json]) {
  return JSON.stringify(json, null, '  ');
});
