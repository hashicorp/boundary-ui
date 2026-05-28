/**
 * Copyright IBM Corp. 2021, 2026
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

// Playback error selectors
export const SESSION_PLAYBACK_ERROR_ALERT =
  '[data-test-session-playback-alert]';
export const SESSION_PLAYBACK_ERROR_MESSAGE = '.playback-error-message';
export const SESSION_PLAYBACK_ERROR_COPY_BUTTON =
  '.playback-error-item .hds-copy-button';

// Flyout and alert selectors
export const SESSION_PLAYBACK_ALERT = '[data-test-session-playback-alert]';
export const SESSION_ERROR_FLYOUT = '[data-test-error-flyout]';
export const SESSION_ERROR_FLYOUT_COPY_BUTTON =
  '[data-test-error-flyout] .hds-copy-button';
export const SESSION_ERROR_FLYOUT_ACCORDION_ITEM =
  '[data-test-error-flyout] .hds-accordion-item';
export const SESSION_ERROR_FLYOUT_CLOSE = '[data-test-error-flyout] button';
