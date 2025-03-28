/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const SAVE_BTN = '[type=submit]';
export const CANCEL_BTN = '.rose-form-actions [type=button]';
export const EDIT_BTN = '.rose-form-actions [type=button]';

export const FIELD_NAME = '[name=name]';
export const FIELD_NAME_VALUE = 'Random name';
export const FIELD_NAME_ERROR = '[data-test-error-message-name]';

export const FIELD_DESCRIPTION = '[name=description]';
export const FIELD_DESCRIPTION_VALUE = 'description';

export const TABLE_RESOURCE_LINK = (url) => `tbody [href="${url}"]`;
export const TABLE_ROW = 'tbody tr';
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

export const GENERAL_SIDEBAR_NAV_LINK = (url) =>
  `[title="General"] a[href="${url}"]`;
export const RESOURCES_SIDEBAR_NAV_LINK = (url) =>
  `[title="Resources"] a[href="${url}"]`;
export const IAM_SIDEBAR_NAV_LINK = (url) => `[title="IAM"] a[href="${url}"]`;

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

// Search filtering selectors
export const SEARCH_INPUT = '.search-filtering [type="search"]';
export const FILTER_DROPDOWN = (filterName) =>
  `.search-filtering [name="${filterName}"] button`;
export const FILTER_DROPDOWN_ITEM = (itemList) => `input[value="${itemList}"]`;
export const FILTER_DROPDOWN_ITEM_APPLY_BTN = (filterName) =>
  `.search-filtering [name="${filterName}"] .hds-dropdown__footer button`;

export const PAGINATION = '[data-test-pagination]';
