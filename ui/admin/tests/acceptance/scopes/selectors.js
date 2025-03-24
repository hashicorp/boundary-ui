/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const SCOPE_FORM = 'main .rose-form';
export const FIELD_STORAGE_POLICY_DROPDOWN = '[name=policy_id]';

export const MANAGE_PROJECTS_DROPDOWN =
  '[data-test-manage-projects-dropdown] button:first-child';
export const MANAGE_PROJECTS_DROPDOWN_DELETE =
  '[data-test-manage-projects-dropdown] ul li button';

export const STORAGE_POLICY_SIDEBAR = '.policy-sidebar';
export const ADD_STORAGE_POLICY_BTN = '.policy-sidebar .hds-button';
export const ADD_STORAGE_POLICY_LINK = '.policy-sidebar .hds-link-standalone';

export const NO_SCOPE_RESULTS_MSG = '[data-test-no-scope-results]';
export const TABLE_ROW_SCOPE_LINK = (id) =>
  `tbody [data-test-scopes-table-row="${id}"] a`;
