/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Takes in the number of seconds and converts to an object with corresponding
 * values for each time duration. For example:
 * { weeks: 0, days: 0, hours: 22, minutes: 15, seconds: 11 }
 * @param {number} value
 * @returns {object}
 */
export const secondsToDuration = (value) => {
  const second = 1;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;

  const weeks = Math.max(Math.floor(value / week), 0);
  const days = Math.max(Math.floor((value % week) / day), 0);
  const hours = Math.max(Math.floor((value % day) / hour), 0);
  const minutes = Math.max(Math.floor((value % hour) / minute), 0);
  const seconds = Math.max(Math.floor((value % minute) / second), 0);

  return { weeks, days, hours, minutes, seconds };
};
