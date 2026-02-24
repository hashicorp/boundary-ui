/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_WORKER_AUTH_REGISTRATION =
  '[name="worker_auth_registration_request"]';
export const FIELD_WORKER_AUTH_REGISTRATION_VALUE = 'token';

export const WORKER_CREATE_SECTION_FORM_LABEL =
  '.worker-create-section label.hds-form-label';
export const WORKER_CREATE_SECTION = '.worker-create-section';
export const ADD_WORKER_TAG_ACTION =
  '[name="api_tags"] tr td:last-child button';

export const MANAGE_DROPDOWN_WORKER =
  '[data-test-manage-worker-dropdown] button:first-child';
export const MANAGE_DROPDOWN_WORKER_REMOVE =
  '[data-test-manage-worker-dropdown] div:nth-child(2) button';
export const MANAGE_DROPDOWN_WORKER_CREATE_TAGS =
  '[data-test-manage-worker-dropdown] ul a:first-child';

export const FIELD_KEY = '[name="api_tags"] tr td:first-child input';
export const FIELD_KEY_VALUE = 'key';

export const FIELD_VALUE = '[name="api_tags"] tr td:nth-child(2) input';
export const FIELD_VALUE_VALUE = 'value';

export const WORKER_TAGS_FLYOUT = '[data-test-worker-tags-flyout]';
export const WORKER_TAGS_FLYOUT_DISMISS_BUTTON =
  '[data-test-worker-tags-flyout] div button';
export const WORKER_TAGS_FLYOUT_TABLE_BODY =
  '[data-test-worker-tags-flyout] tbody';
export const WORKER_TAGS_FLYOUT_TABLE_ROWS =
  '[data-test-worker-tags-flyout] tbody tr';
export const WORKER_TAGS_FLYOUT_VIEW_MORE_TAGS_BUTTON =
  '[data-test-worker-tags-flyout] .view-more-tags a';

export const WORKER_TAGS_FILTER_DROPDOWN =
  '.workers .hds-dropdown-toggle-button';
export const WORKER_TAGS_FILTER_DROPDOWN_FIRST_ITEM =
  '.workers .hds-dropdown-list-item:nth-of-type(2) input';
export const WORKER_TAGS_FILTER_APPLY_BUTTON =
  '.workers [data-test-dropdown-apply-button]';

export const TABLE_ROW_WORKER_TAGS_FLYOUT_BUTTON = (workerId) =>
  `[data-test-worker-tags-flyout-button="${workerId}"]`;
export const TABLE_ROW_CONFIG_TAG_TOOLTIP_BUTTON =
  'tbody tr:first-child td:nth-child(3) button';
export const TABLE_ROW_CONFIG_TAG_TOOLTIP_TEXT =
  'tbody tr:first-child td:nth-child(3) > div';
export const TABLE_ROW_API_TAG_KEY = (row) =>
  `tbody tr:nth-child(${row}) td:first-child pre`;
export const TABLE_ROW_API_TAG_VALUE = (row) =>
  `tbody tr:nth-child(${row}) td:nth-child(2) pre`;
export const TABLE_ROW_API_TAG_ACTION_DROPDOWN =
  'tbody tr:nth-child(4) td:nth-child(4) button';
export const TABLE_ROW_API_TAG_ACTION_DROPDOWN_FIRST_BUTTON =
  'tbody tr:nth-child(4) td:nth-child(4) ul li:first-child button';
export const TABLE_ROW_API_TAG_ACTION_DROPDOWN_LAST_BUTTON =
  'tbody tr:nth-child(4) td:nth-child(4) ul li:nth-child(2) button';

export const MODAL_EDIT_TAG_FIELD_KEY =
  '[data-test-edit-modal] [name="edit-tag-key"]';
export const MODAL_EDIT_TAG_FIELD_VALUE =
  '[data-test-edit-modal] [name="edit-tag-value"]';
export const MODAL_EDIT_TAG_SAVE_BUTTON =
  '[data-test-edit-modal] button:first-child';
export const MODAL_EDIT_TAG_CANCEL_BUTTON =
  '[data-test-edit-modal] button:last-child';

export const MODAL_CONFIRMATION_FIELD_REMOVE =
  '[data-test-confirmation-modal] input';
export const MODAL_CONFIRMATION_SAVE_BUTTON =
  '[data-test-confirmation-modal] button:first-child';
export const MODAL_CONFIRMATION_CANCEL_BUTTON =
  '[data-test-confirmation-modal] button:last-child';

export const NO_TAGS_STATE_TITLE = '[data-test-no-tags] div:first-child';
export const NO_TAGS_STATE_ACTION = '[data-test-no-tags] div:nth-child(3) a';
