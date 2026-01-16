/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Formats a date string into a user-friendly date/time format.
 * Example: Jan 1, 2024, 12:00:00 AM GMT
 * @param {date string} value
 * @returns
 */
export const formatDateUserFriendly = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(new Date(value));
