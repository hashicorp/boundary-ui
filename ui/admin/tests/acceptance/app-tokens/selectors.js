/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_TTL = '[name=time_to_live_seconds]';
export const FIELD_TTL_DAYS = '[name="time_to_live_seconds"] [name="days"]';
export const FIELD_TTL_HOURS = '[name="time_to_live_seconds"] [name="hours"]';
export const FIELD_TTL_MINUTES =
  '[name="time_to_live_seconds"] [name="minutes"]';
export const FIELD_TTS = '[name=time_to_stale_seconds]';
export const FILED_CONFIRM_REVOKE = '[name=confirm-revoke]';

export const CANCEL_MODAL_BTN = '.hds-modal .hds-button--color-secondary';
export const CONFIRM_APP_TOKEN_BTN = '.hds-modal .hds-button--color-primary';
export const CONFIRM_REVOKE_BTN = '.hds-modal .hds-button--color-critical';

export const TOKEN_COPY_SNIPPET =
  '.app-token-modal-body .hds-copy-snippet__text';
export const BREADCRUMB = '[data-test-breadcrumbs-container]';
export const STATUS_BADGE_TEXT =
  '[data-test-app-token-status-badge] .hds-badge__text';

export const ROW_LABEL = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(1)`;
export const ROW_GRANTS = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(2)`;
export const ROW_ACTIVE_SCOPES = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(3)`;
export const ROW_DELETED_SCOPES = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(4)`;

export const MANAGE_DROPDOWN = '[data-test-manage-app-token] button';
export const MANAGE_DROPDOWN_REVOKE = '[data-test-manage-app-token-revoke]';
export const MANAGE_DROPDOWN_CLONE = '[data-test-manage-app-token-clone]';

// Flyout selectors
export const GRANTS_FLYOUT = '[data-test-grants-flyout]';
export const ACTIVE_SCOPES_FLYOUT = '[data-test-active-scopes-flyout]';
export const DELETED_SCOPES_FLYOUT = '[data-test-deleted-scopes-flyout]';
export const FLYOUT_CLOSE_BTN = '.hds-flyout .hds-button--color-secondary';
export const FLYOUT_HEADER = '.hds-flyout__header';
export const FLYOUT_TABLE_ROWS = '.hds-flyout tbody tr';
export const GRANTS_BTN = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(2) button`;
export const ACTIVE_SCOPES_BTN = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(3) button`;
export const DELETED_SCOPES_BTN = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(4) button`;
export const FLYOUT_TABLE_SCOPE_NAME = (rowIndex) =>
  `[data-test-active-scopes-flyout] tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(1)`;
export const FLYOUT_TABLE_SCOPE_LINK = (rowIndex) =>
  `[data-test-active-scopes-flyout] tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(1) a`;
