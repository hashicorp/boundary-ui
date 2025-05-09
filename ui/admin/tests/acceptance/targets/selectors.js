/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_TYPE_CHECKED = '[name="Type"]:checked';
export const FIELD_TYPE_VALUE = (type) => `[value=${type}]`;
export const FIELD_DEFAULT_PORT_LABEL = '[data-test-default-port-label]';
export const FIELD_INFO = '.info-field';
export const FIELD_INFO_LABEL = '.info-field .hds-form-helper-text';
export const FIELD_ALIASES =
  '[name="with_aliases"] tbody tr:last-of-type input';
export const FIELD_ALIASES_ADD_BTN =
  '[name="with_aliases"] tbody tr:last-of-type button';
export const FIELD_ERROR = '.hds-form-error__message';
export const FIELD_ADDRESS = '[name="address"]';
export const FIELD_ADDRESS_VALUE = '0.0.0.0';

export const NEW_TARGET_BTN = '[data-test-new-target-button';
export const MANAGE_DROPDOWN = '[data-test-manage-targets-dropdown] button';
export const MANAGE_DROPDOWN_DELETE =
  '[data-test-manage-targets-dropdown] ul li:last-child button';

export const ALIASES_SIDEBAR = '.target-sidebar-aliases';
export const ALIASES_SIDEBAR_LIST = '.target-sidebar-aliases .link-list-item';
export const ALIASES_NEW_LINK = '.target-sidebar-aliases .hds-button';
export const ALIASES_NEW_LINK_TEXT = 'Add an alias';
export const ALIASES_VIEW_MORE_BTN = '[data-test-aliases-view-more]';
export const ALIASES_FLYOUT = '[data-test-aliases-flyout]';

export const NO_RESULTS_MSG = '[data-test-no-target-results]';
export const TABLE_ACTIVE_SESSIONS = (id) =>
  `tbody [data-test-targets-table-row="${id}"] .hds-table__td:nth-child(3) a`;
export const TABLE_SESSIONS_ID = (id) =>
  `tbody [data-test-sessions-table-row="${id}"] .hds-table__td:first-child`;
