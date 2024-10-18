/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const APP_HEADER_DROPDOWN =
  '.rose-header-utilities details:first-child summary';

export const MANAGE_DROPDOWN =
  '[data-test-manage-auth-methods-dropdown] button';
export const MANAGE_DROPDOWN_NEW_ACCOUNT = (url) =>
  `[data-test-manage-auth-methods-dropdown] a[href="${url}"]`;

export const FIELD_CURRENT_PASSWORD = '[name=currentPassword]';
export const FIELD_CURRENT_PASSWORD_VALUE = 'current password';

export const FIELD_NEW_PASSWORD = '[name=newPassword]';
export const FIELD_NEW_PASSWORD_VALUE = 'new password';

export const FIELD_NAME = '[name=name]';
export const FIELD_NAME_VALUE = 'account name';

export const FIELD_DESCRIPTION = '[name=description]';
export const FIELD_DESCRIPTION_VALUE = 'description';

export const FIELD_LOGIN_NAME = '[name=login_name]';
export const FIELD_LOGIN_NAME_VALUE = 'username';

export const FIELD_PASSWORD = '[name=password]';
export const FIELD_PASSWORD_VALUE = 'password';
