/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export const SCOPE_FORM = 'main form';
export const FIELD_STORAGE_POLICY_SELECT = '[name=policy_id]';

export const MANAGE_PROJECTS_DROPDOWN =
  '[data-test-manage-projects-dropdown] button:first-child';
export const MANAGE_PROJECTS_DROPDOWN_DELETE =
  '[data-test-manage-projects-dropdown] ul li button';

export const STORAGE_POLICY_SIDEBAR = '[data-test-storage-policy-sidebar]';
export const ADD_STORAGE_POLICY_BTN =
  '[data-test-storage-policy-sidebar] .hds-button';
export const ADD_STORAGE_POLICY_LINK =
  '[data-test-storage-policy-sidebar] .hds-link-standalone';

export const ALIAS_SUFFIX_SIDEBAR = '[data-test-alias-suffix-sidebar]';
export const CREATE_ALIAS_SUFFIX_BTN =
  '[data-test-alias-suffix-sidebar] .hds-button';
export const ALIAS_SUFFIX_VALUE =
  '[data-test-alias-suffix-sidebar] .link-list-item__text';
export const ALIAS_SUFFIX_DROPDOWN_TOGGLE =
  '[data-test-alias-suffix-dropdown] button';
export const ALIAS_SUFFIX_EDIT_ITEM = '[data-test-alias-suffix-edit]';
export const ALIAS_SUFFIX_DELETE_ITEM = '[data-test-alias-suffix-delete]';
export const FIELD_ALIAS_SUFFIX = '[name=alias_suffix]';
export const ORG_SUFFIX_ALERT = '[data-test-org-suffix-alert]';
export const ORG_SUFFIX_ALERT_LINK = '[data-test-org-suffix-alert-link]';

export const NO_SCOPE_RESULTS_MSG = '[data-test-no-scope-results]';
export const TABLE_ROW_SCOPE_LINK = (id) =>
  `tbody [data-test-scopes-table-row="${id}"] a`;
