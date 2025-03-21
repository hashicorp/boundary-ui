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

export const ROLE_BADGE = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) .hds-badge__text`;
export const ROLE_TOOLTIP_BTN = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) .hds-tooltip-button`;
export const ROLE_TOOLTIP_CONTENT = (id) =>
  `tbody [data-test-role-row="${id}"] td:nth-child(2) [data-tippy-root]`;

export const NO_RESULTS_MSG = '[data-test-no-role-results]';
