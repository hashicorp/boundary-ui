/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';

/**
 * Takes a `Date` instance and returns a string formatted in human-friendly
 * ISO-ish, e.g. "2020-01-01 00:00:00".
 */
export default helper(function formatDateIsoHuman(params /*, hash*/) {
  return params[0]
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d*Z/, '');
});
