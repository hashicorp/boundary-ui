/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_CRED_TYPE = '[name=credential_type]';
export const FIELD_CRED_TYPE_SSH_VALUE = 'ssh_private_key';
export const FIELD_CRED_TYPE_UPD_VALUE = 'username_password_domain';

export const FIELD_VAULT_PATH = '[name=vault_path]';
export const FIELD_VAULT_PATH_VALUE = 'path';
export const FIELD_VAULT_PATH_ERROR = '[data-test-error-message-vault-path]';

export const FIELD_USERNAME = '[name=username]';
export const FIELD_USERNAME_VALUE = 'username';

export const FIELD_KEY_TYPE = '[name=key_type]';
export const FIELD_KEY_TYPE_VALUE = 'rsa';

export const FIELD_KEY_BITS = '[name=key_bits]';
export const FIELD_KEY_BITS_VALUE = 100;

export const FIELD_TTL = '[name=ttl]';
export const FIELD_TTL_VALUE = 'ttl';

export const FIELD_KEY_ID = '[name=key_id]';
export const FIELD_KEY_ID_VALUE = 'key_id';

export const FIELD_CRED_MAP_OVERRIDES_SELECT =
  '[name="credential_mapping_overrides"] select';
export const FIELD_CRED_MAP_OVERRIDES_SELECT_SSH_VALUE =
  'private_key_attribute';
export const FIELD_CRED_MAP_OVERRIDES_SELECT_DOMAIN_VALUE = 'domain_attribute';
export const FIELD_CRED_MAP_OVERRIDES_INPUT =
  '[name="credential_mapping_overrides"] input';
export const FIELD_CRED_MAP_OVERRIDES_BTN =
  '[name="credential_mapping_overrides"] button';

export const TYPE_VAULT_SSH_CERT = '[value="vault-ssh-certificate"]';
export const TYPE_VAULT_LDAP = '[value="vault-ldap"]';
export const TYPE_VAULT_GENERIC = '[value="vault-generic"]';

export const FIELD_CRIT_OPTS_KEY =
  '[name="critical_options"] tbody td:nth-of-type(1) input';
export const FIELD_CRIT_OPTS_VALUE =
  '[name="critical_options"] tbody td:nth-of-type(2) input';
export const FIELD_CRIT_OPTS_BTN = '[name="critical_options"] button';

export const FIELD_EXT_KEY =
  '[name="extensions"] tbody td:nth-of-type(1) input';
export const FIELD_EXT_VALUE =
  '[name="extensions"] tbody td:nth-of-type(2) input';
export const FIELD_EXT_BTN = '[name="extensions"] button';

export const MANAGE_DROPDOWN_CRED_LIB =
  '[data-test-manage-credential-library-dropdown] button:first-child';
export const MANAGE_DROPDOWN_CRED_LIB_DELETE =
  '[data-test-manage-credential-library-dropdown] ul li button';

export const MANAGE_DROPDOWN_CREDENTIAL_STORE =
  '[data-test-manage-credential-stores-dropdown] button';
