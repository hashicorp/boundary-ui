/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// START TODO: Remove common selectors from storage-bucket specific selectors
export const FIELD_NAME = '[name=name]';
export const FIELD_NAME_VALUE = 'Random name';
// END TODO: Remove common selectors from storage-bucket specific selectors

export const FIELD_SCOPE = '[name=scope]';
export const FIELD_PLUGIN_TYPE = '[name=plugin_type]';
export const FIELD_PLUGIN_TYPE_MINIO = '[value=minio]'; // Provider
export const FIELD_ENDPOINT_URL = '[name=endpoint_url]';
export const FIELD_ENDPOINT_URL_VALUE = 'http://www.hashicorp.com';
export const FIELD_BUCKET_NAME = '[name=bucket_name]';
export const FIELD_BUCKET_NAME_VALUE = 'Test Bucket name';
export const FIELD_BUCKET_NAME_ERROR = '[data-test-bucket-name-error]';
export const FIELD_BUCKET_PREFIX = '[name=bucket_prefix]';
export const FIELD_REGION = '[name=region]';
export const GROUP_CREDENTIAL_TYPE = '[name=credential_type]';
export const FIELD_STATIC_CREDENTIAL = '[value=static]';
export const FIELD_DYNAMIC_CREDENTIAL = '[value=dynamic]';
export const FIELD_ROLE_ARN = '[name=role_arn]';
export const FIELD_ROLE_ARN_VALUE = 'test-arn-id';
export const FIELD_ACCESS_KEY = '[name=access_key_id]';
export const FIELD_ACCESS_KEY_EDIT_BTN =
  '[data-test-access-key-id] [type=button]';
export const FIELD_ACCESS_KEY_VALUE = '45$#@%!783528';
export const FIELD_SECRET_KEY = '[name=secret_access_key] ';
export const FIELD_SECRET_KEY_VALUE = '87^%$#@^86382';
export const FIELD_SECRET_KEY_EDIT_BTN =
  '[data-test-secret-access-key] [type=button]';
export const FIELD_WORKER_FILTER = '[name=worker_filter]';
export const FIELD_WORKER_FILTER_ERROR = '[data-test-worker-filter-error]';
export const TOAST = '[role=alert] div';
export const TOAST_SUCCESSFULL_VALUE = 'Saved successfully.';
