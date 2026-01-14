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

export const CREATE_BTN = '.rose-form-actions .hds-button--color-primary';
export const CANCEL_BTN = '.rose-form-actions .hds-button--color-secondary';
export const CANCEL_MODAL_BTN = '.hds-modal .hds-button--color-secondary';
export const CONFIRM_APP_TOKEN_BTN = '.hds-modal .hds-button--color-primary';

export const TOKEN_COPY_SNIPPET =
  '.app-token-modal-body .hds-copy-snippet__text';
export const BREADCRUMB = '[data-test-breadcrumbs-container]';
export const ROW_LABEL = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(1)`;
export const ROW_GRANTS = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(2)`;
export const ROW_ACTIVE_SCOPES = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(3)`;
export const ROW_DELETED_SCOPES = (rowIndex) =>
  `table tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(4)`;
