/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const NEW_ROLE_BTN = '[data-test-new-role-button]';

export const MANAGE_DROPDOWN_ROLES = '[data-test-manage-roles-dropdown] button';
export const MANAGE_DROPDOWN_ROLES_PRINCIPALS =
  '[data-test-manage-dropdown-principals]';
export const MANAGE_DROPDOWN_ROLES_SCOPES =
  '[data-test-manage-dropdown-scopes]';
export const MANAGE_DROPDOWN_ROLES_REMOVE =
  '[data-test-manage-roles-dropdown] div:last-child button';
export const MANAGE_DROPDOWN_ADD_PRINCIPALS =
  '[data-test-manage-role-principals]';

export const ROLE_BADGE = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) .hds-badge__text`;
export const ROLE_TOOLTIP_BTN = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) .hds-tooltip-button`;
export const ROLE_TOOLTIP_CONTENT = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) [data-tippy-root]`;
export const GRANT_SCOPE_ROW = (id) =>
  `tbody [data-test-grant-scope-row="${id}"]`;
export const GRANT_SCOPE_PARENT_SCOPE =
  'tbody tr:nth-child(2) td:nth-child(3) a';
export const TABLE_ALL_CHECKBOX = 'thead input[type="checkbox"]';

export const NO_RESULTS_MSG = '[data-test-no-role-results]';
export const NO_RESULTS_GRANT_SCOPE_MSG = '[data-test-no-grant-scope-results]';

export const NO_SCOPES_MSG = '.role-grant-scopes div';
export const NO_SCOPES_MSG_LINK = '.role-grant-scopes div div:nth-child(3) a';

// Manage scopes selectors
export const SCOPE_TOGGLE = (name) => `.hds-form-toggle input[name="${name}"]`;
export const SCOPE_CHECKBOX = (type, id) =>
  `tbody [data-test-${type}-scopes-table-row="${id}"] input`;
export const MANAGE_CUSTOM_SCOPES_BUTTON_ICON =
  '[data-test-manage-custom-scopes-button] [data-test-icon="check-circle"]';
export const MANAGE_CUSTOM_SCOPES_BUTTON =
  '[data-test-manage-custom-scopes-button]';
export const REMOVE_ORG_MODAL = (name) =>
  `[data-test-manage-scopes-remove-${name}-modal]`;
export const REMOVE_ORG_ONLY_BTN = (name) =>
  `[data-test-manage-scopes-remove-${name}-modal] div:nth-child(3) button:last-of-type`;
export const REMOVE_ORG_PROJECTS_BTN = (name) =>
  `[data-test-manage-scopes-remove-${name}-modal] div:nth-child(3) button`;

// Role grants
export const FIELD_NEW_GRANT = 'form:nth-child(1) [name="grant"]';
export const FIELD_NEW_GRANT_ADD_BTN = 'form:nth-child(1) [type="submit"]';
export const FIELD_GRANT = 'form:nth-child(2) [name="grant"]';
export const FIELD_GRANT_VALUE = 'ids=123,action=delete';
export const FIELD_GRANT_REMOVE_BTN = 'form:nth-child(2) button[type="button"]';
export const GRANTS_FORM = 'form:nth-child(2)';
// We need to use a different selector for the grants form because the
// grants form has multiple submit buttons
export const SAVE_BTN = '.rose-form-actions [type=submit]';
