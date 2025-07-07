/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_TYPE_CHECKED = '[name="Type"]:checked';
export const FIELD_TYPE_VALUE = (type) => `[value=${type}]`;
export const FIELD_DEFAULT_PORT_LABEL = '[data-test-default-port-label]';
export const FIELD_INFO = '.info-field';
export const FIELD_INFO_LABEL = '.info-field .hds-form-helper-text';
export const FIELD_ALIAS = '[name="value"]';
export const FIELD_DESTINATION_ID = '[name="destination_id"]';
export const FIELD_ALIASES =
  '[name="with_aliases"] tbody tr:last-of-type input';
export const FIELD_ALIASES_ADD_BTN =
  '[name="with_aliases"] tbody tr:last-of-type button';
export const FIELD_ADDRESS = '[name="address"]';
export const FIELD_ADDRESS_VALUE = '0.0.0.0';
export const FIELD_NAME_ERROR = '[data-test-error-message-name]';
export const FIELD_DEFAULT_PORT_ERROR =
  '[data-test-error-message-default-port]';
export const FIELD_STORAGE_BUCKET_DROPDOWN = '[name=storage_bucket_id]';
export const FIELD_ENABLE_RECORDING_TOGGLE =
  '[name=target-enable-session-recording]';
export const FIELD_ADD_NEW_STORAGE_BUCKET_LINK =
  '.enable-session-recording-toggle .hds-link-standalone';

export const NEW_TARGET_BTN = '[data-test-new-target-button]';
export const MANAGE_DROPDOWN = '[data-test-manage-targets-dropdown] button';
export const MANAGE_DROPDOWN_DELETE =
  '[data-test-manage-targets-dropdown] ul li:last-child button';
export const MANGE_DROPDOWN_ADD_BROKERED_CREDENTIALS =
  '[data-test-manage-targets-dropdown] [data-test-add-brokered-cred-sources-action]';
export const MANGE_DROPDOWN_ADD_INJECTED_CREDENTIALS =
  '[data-test-manage-targets-dropdown] [data-test-add-injected-cred-sources-action]';
export const MANAGE_DROPDOWN_ADD_HOST_SOURCES =
  '[data-test-manage-targets-dropdown] [data-test-add-host-sources-action]';

export const ALIASES_SIDEBAR = '.target-sidebar-aliases';
export const ALIASES_SIDEBAR_LIST = '.target-sidebar-aliases .link-list-item';
export const ALIASES_NEW_LINK = '.target-sidebar-aliases .hds-button';
export const ALIASES_NEW_LINK_TEXT = 'Add an alias';
export const ALIASES_VIEW_MORE_BTN = '[data-test-aliases-view-more]';
export const ALIASES_FLYOUT = '[data-test-aliases-flyout]';
export const ALIASES_ADD_BTN = '.target-sidebar-aliases .hds-button';

export const ENABLE_RECORDING_BTN = '.target-sidebar .hds-button';
export const RECORDING_SETTINGS_LINK = '.target-sidebar .hds-link-standalone';
export const LINK_LIST_ITEM = '.link-list-item > a';
export const LINK_LIST_ITEM_TEXT = '.link-list-item__text';

export const STORAGE_BUCKET_DROPDOWN = '[name=storage_bucket_id]';

export const NO_RESULTS_MSG = '[data-test-no-target-results]';
export const TABLE_ACTIVE_SESSIONS = (id) =>
  `tbody [data-test-targets-table-row="${id}"] .hds-table__td:nth-child(3) a`;
export const TABLE_SESSIONS_ID = (id) =>
  `tbody [data-test-sessions-table-row="${id}"] .hds-table__td:first-child`;
export const TABLE_CREDENTIAL_SOURCE_CHECKBOX = (type) =>
  `tbody [data-test-credential-source="${type}"] input[type="checkbox"]`;

export const CODE_BLOCK_CONTENT = (name) =>
  `[data-test-target-${name}-workers-accordion-item] .hds-code-block__body`;
export const WORKERS_ACCORDION_DROPDOWN = (name) =>
  `[data-test-target-${name}-workers-accordion-item] .hds-accordion-item__button`;
export const WORKERS_ACCORDION_DROPDOWN_TEXT = (name) =>
  `[data-test-target-${name}-workers-accordion-item] a`;
