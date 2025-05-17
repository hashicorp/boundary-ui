/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const SESSION_RECORDING_TITLE = 'Session Recordings';
export const TABLE_FIRST_ROW_ACTION_LINK =
  'tbody tr:first-child td:last-child a';
export const SESSION_RECORDING_PLAYER = '.session-recording-player';
export const SESSION_RECORDING_PLAYER_LINK =
  '.session-recording-player-header > a';
export const RETAIN_UNTIL_OPTION = '[data-test-retain-until]';
export const DELETE_AFTER_OPTION = '[data-test-delete-after]';

// Search and filtering selectors
export const NO_RESULTS_MSG = '[data-test-no-session-recording-results]';
export const LAST_3_DAYS_OPTION =
  '[data-test-session-recordings-bar] div[name="time"] li:nth-child(2) button';

// Manage actions dropdown selectors
export const MANAGE_DROPDOWN =
  '[data-test-manage-channels-dropdown] button:first-child';
export const DELETE_ACTION =
  '[data-test-manage-channels-dropdown] ul li:last-child button';

// Sorting selectors
export const TABLE_SORT_BTN = (column) =>
  `[data-test-session-recordings-sort-by-${column}] button`;
export const TABLE_SORT_BTN_ARROW_UP = (column) =>
  `[data-test-session-recordings-sort-by-${column}] button .hds-icon-arrow-up`;
export const TABLE_SORT_BTN_ARROW_DOWN = (column) =>
  `[data-test-session-recordings-sort-by-${column}] button .hds-icon-arrow-down`;
