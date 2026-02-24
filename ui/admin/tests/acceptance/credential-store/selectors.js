/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

// Manage actions dropdown selectors
export const MANAGE_DROPDOWN =
  '[data-test-manage-credential-stores-dropdown] button:first-child';
export const NEW_CREDENTIAL_ACTION =
  '[data-test-manage-credential-stores-dropdown] ul li:nth-child(1) a';
export const EDIT_WORKER_FILTER_ACTION =
  '[data-test-manage-credential-stores-dropdown] ul li:nth-child(2) a';
export const DELETE_ACTION =
  '[data-test-manage-credential-stores-dropdown] ul li:last-child button';

// Search filtering selectors
export const NO_RESULTS_MSG = '[data-test-no-credential-store-results]';

export const CODE_BLOCK_BODY = '.hds-code-block__code';
export const EDITOR_WORKER_FILTER_VALUE = '"dev" in "/tags/env"';

export const TYPE_VAULT = '[value="vault"]';

export const FIELD_VAULT_ADDRESS = '[name="address"]';
export const FIELD_VAULT_ADDRESS_ERROR =
  '[data-test-error-message-vault-address]';
