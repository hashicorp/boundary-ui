/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// Manage actions dropdown selectors
export const MANAGE_DROPDOWN =
  '[data-test-manage-credential-stores-dropdown] button:first-child';
export const EDIT_WORKER_FILTER_ACTION =
  '[data-test-manage-credential-stores-dropdown] ul li:nth-child(2) a';
export const DELETE_ACTION =
  '[data-test-manage-credential-stores-dropdown] ul li:last-child button';

export const CODE_EDITOR_BODY = '[data-test-code-editor-field-editor] textarea';
export const CODE_BLOCK_BODY = '.hds-code-block__code';

export const TYPE_VAULT = '[value="vault"]';

export const FIELD_VAULT_ADDRESS = '[name="address"]';
export const FIELD_VAULT_ADDRESS_ERROR =
  '[data-test-error-message-vault-address]';
