/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * Takes a `Date` instance and returns a string formatted in long format
 * e.g. "Oct 27, 2025, 3:30 PM PST"
 */
export default helper(function formatDateLong([date] /*, hash*/) {
  if (!date) return '';

  const formatted = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });

  // Replace "at" with "," to match the design
  return formatted.replace(' at ', ', ');
});
