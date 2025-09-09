/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_TYPE = '[name="Type"]';
export const FIELD_TYPE_VALUE = (type) => `[value=${type}]`;

export const FIELD_WORKER_FILTER = '[name=worker_filter]';
export const FIELD_AWS_WORKER_FILTER_LABEL =
  '[data-test-aws-worker-filter-label]';

export const FIELD_ZONE = '[name="zone"]';
export const FIELD_ZONE_VALUE = 'us-west-1';

export const FIELD_PROJECT = '[name="project_id"]';
export const FIELD_PROJECT_VALUE = 'project ID';

export const FIELD_CLIENT_EMAIL = '[name="client_email"]';
export const FIELD_CLIENT_EMAIL_VALUE = 'email';

export const NO_RESULTS_MSG = '[data-test-no-host-catalog-results]';

export const MANAGE_DROPDOWN_HOST_CATALOG =
  '[data-test-manage-host-catalogs-dropdown] button:first-child';
export const MANAGE_DROPDOWN_HOST_CATALOG_DELETE =
  '[data-test-manage-host-catalogs-dropdown] ul li button';

export const FIELD_ROLE_ARN = '[name="role_arn"]';
export const FIELD_ROLE_ARN_VALUE = 'arn:aws:iam';

export const FIELD_CREDENTIAL_TYPE =
  '.credential-selection input:checked';
export const FIELD_DYNAMIC_CREDENTIAL = '[name="dynamic-credential"]';
export const FIELD_DYNAMIC_CREDENTIAL_VALUE = 'dynamic-credentials';
export const FIELD_STATIC_CREDENTIAL = '[name="static-credential"]';
