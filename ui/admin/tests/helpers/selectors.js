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

export const RESOURCE_NOT_FOUND_SUBTITLE = '.rose-message-subtitle';
export const RESOURCE_NOT_FOUND_VALUE = 'Error 404';

export const PAGE_MESSAGE_DESCRIPTION = '.rose-message-description';
export const PAGE_MESSAGE_LINK = '.rose-message-body .hds-link-standalone';

export const HREF = (url) => `[href="${url}"]`;

export const SIDEBAR_NAV_LINK = (url) => `[title="General"] a[href="${url}"]`;

export const ALERT_TOAST = '[data-test-toast-notification]';
export const ALERT_TOAST_BODY =
  '[data-test-toast-notification] .hds-alert__description';
export const ALERT_TOAST_DISMISS =
  '[data-test-toast-notification] .hds-dismiss-button';

export const DIALOG_UNSAVED_CHANGES = '.rose-dialog';
export const DIALOG_UNSAVED_CHANGES_DISCARD =
  '.rose-dialog-footer button:first-child';
export const DIALOG_UNSAVED_CHANGES_CANCEL =
  '.rose-dialog-footer button:last-child';
