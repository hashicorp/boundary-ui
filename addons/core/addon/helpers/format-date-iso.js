/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * Takes a `Date` instance and returns a string formatted in ISO,
 * e.g. "2020-01-01T00:00:00.999Z".
 */
export default helper(function formatDateIso(params /*, hash*/) {
  return params[0]?.toISOString();
});
