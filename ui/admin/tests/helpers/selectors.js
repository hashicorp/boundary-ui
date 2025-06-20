/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const SAVE_BTN = '[type=submit]';
export const CANCEL_BTN = '.rose-form-actions [type=button]';
export const EDIT_BTN = '.rose-form-actions [type=button]';
export const DELETE_BTN = '.hds-dropdown-list-item--color-critical button';

export const FIELD_NAME = '[name=name]';
export const FIELD_NAME_VALUE = 'Random name';
export const FIELD_NAME_ERROR = '[data-test-error-message-name]';

export const FIELD_DESCRIPTION = '[name=description]';
export const FIELD_DESCRIPTION_VALUE = 'description';

export const FIELD_PASSWORD = '[name=password]';
export const FIELD_PASSWORD_VALUE = 'password';

export const FIELD_ERROR = '.hds-form-error__message'; // Selects any error message on the DOM.
export const FIELD_IDENTIFICATION = '[name=identification]';

export const TABLE_RESOURCE_LINK = (url) => `tbody [href="${url}"]`;
export const TABLE_ROWS = 'tbody tr';
export const TABLE_ROW = (row) => `tbody tr:nth-child(${row})`;
export const TABLE_ROW_CHECKBOX = 'tbody tr input[type="checkbox"]';
export const TABLE_FIRST_ROW_ACTION_DROPDOWN =
  'tbody tr:first-child td:last-child button';
export const TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN =
  'tbody tr:first-child td:last-child ul li button';
export const TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_LINK =
  'tbody tr:first-child td:last-child ul li a';

export const RESOURCE_NOT_FOUND_SUBTITLE =
  '[data-test-error-application-state] .hds-application-state__error-code';
export const RESOURCE_NOT_FOUND_VALUE = 'ERROR 404';

export const PAGE_MESSAGE_HEADER = '.hds-application-state__header';
export const PAGE_MESSAGE_DESCRIPTION = '.hds-application-state__body-text';
export const PAGE_MESSAGE_LINK =
  '.hds-application-state__footer .hds-link-standalone';

export const HREF = (url) => `[href="${url}"]`;

export const SIDEBAR_NAV_LINK = (url) =>
  `.hds-side-nav__content a[href="${url}"]`;
export const SIDEBAR_NAV_CONTENT = '.hds-side-nav__content';
export const SIDEBAR_USER_DROPDOWN =
  '[data-test-side-nav-user-dropdown] button';
export const SIDEBAR_SCOPE_DROPDOWN =
  '[data-test-side-nav-scope-dropdown] button';
export const SIDEBAR_SCOPE_LINK = (url) =>
  `[data-test-side-nav-scope-dropdown] a[href="${url}"]`;
export const TOGGLE_THEME_DEFAULT =
  '[data-test-side-nav-user-dropdown] [value=system-default-theme]';
export const TOGGLE_THEME_LIGHT =
  '[data-test-side-nav-user-dropdown] [value=light]';
export const TOGGLE_THEME_DARK =
  '[data-test-side-nav-user-dropdown] [value=dark]';

export const ALERT_TOAST = '[data-test-toast-notification]';
export const ALERT_TOAST_BODY =
  '[data-test-toast-notification] .hds-alert__description';
export const ALERT_TOAST_DISMISS =
  '[data-test-toast-notification] .hds-dismiss-button';

export const MODAL_WARNING = 'dialog';
export const MODAL_WARNING_CONFIRM_BTN =
  'dialog .hds-modal__footer button:first-child';
export const MODAL_WARNING_CANCEL_BTN =
  'dialog .hds-modal__footer button:last-child';
export const MODAL_WARNING_TITLE = '.hds-modal__header';
export const MODAL_WARNING_MESSAGE = '.hds-modal__body';

export const AUTH_SCOPE_DROPDOWN = '.hds-dropdown button';
export const AUTH_SCOPE_DROPDOWN_OPTIONS = '.hds-dropdown a';

// Search filtering selectors
export const SEARCH_INPUT = '.search-filtering [type="search"]';
export const FILTER_DROPDOWN = (filterName) =>
  `.search-filtering [name="${filterName}"] button`;
export const FILTER_DROPDOWN_ITEM = (itemList) => `input[value="${itemList}"]`;
export const FILTER_DROPDOWN_ITEM_APPLY_BTN = (filterName) =>
  `.search-filtering [name="${filterName}"] .hds-dropdown__footer button`;

export const PAGINATION = '[data-test-pagination]';
export const LINK_LIST_ITEM_TEXT = '.link-list-item__text';
export const FORM = 'main form';

// Sorting selectors
export const TABLE_SORT_BTN = (column) =>
  `thead tr th:nth-child(${column}) button`;
export const TABLE_SORT_BTN_ARROW_UP = (column) =>
  `thead tr th:nth-child(${column}) button .hds-icon-arrow-up`;
export const TABLE_SORT_BTN_ARROW_DOWN = (column) =>
  `thead tr th:nth-child(${column}) button .hds-icon-arrow-down`;
