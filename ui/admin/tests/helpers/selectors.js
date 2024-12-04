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

export const RESOURCE_NOT_FOUND_SUBTITLE =
  '[data-test-error-application-state] .hds-application-state__error-code';
export const RESOURCE_NOT_FOUND_VALUE = 'ERROR 404';

export const PAGE_MESSAGE_DESCRIPTION = '.hds-application-state__body-text';
export const PAGE_MESSAGE_LINK =
  '.hds-application-state__footer .hds-link-standalone';

export const HREF = (url) => `[href="${url}"]`;

export const SIDEBAR_NAV_LINK = (url) => `[title="General"] a[href="${url}"]`;

export const ALERT_TOAST = '[data-test-toast-notification]';
export const ALERT_TOAST_BODY =
  '[data-test-toast-notification] .hds-alert__description';
export const ALERT_TOAST_DISMISS =
  '[data-test-toast-notification] .hds-dismiss-button';
