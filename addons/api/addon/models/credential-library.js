/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedCredentialLibraryModel from '../generated/models/credential-library';
import {
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';
/**
 * Enum options for credential library.
 */
export const options = {
  http_method: ['GET', 'POST'],
  key_type: ['ed25519', 'ecdsa', 'rsa'],
  credential_types: [
    TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
    TYPE_CREDENTIAL_USERNAME_PASSWORD,
    TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
    TYPE_CREDENTIAL_PASSWORD,
  ],
  mapping_overrides: {
    username_password: ['username_attribute', 'password_attribute'],
    ssh_private_key: [
      'private_key_attribute',
      'private_key_passphrase_attribute',
      'username_attribute',
    ],
    username_password_domain: [
      'username_attribute',
      'password_attribute',
      'domain_attribute',
    ],
    password: ['password_attribute'],
  },
};

export const TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC = 'vault-generic';
export const TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE =
  'vault-ssh-certificate';
export const TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP = 'vault-ldap';

/**
 * Supported Credential Library types.
 */
export const TYPES_CREDENTIAL_LIBRARY = Object.freeze([
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
]);

export default class CredentialLibraryModel extends GeneratedCredentialLibraryModel {
  // =attributes

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_CREDENTIAL_LIBRARY.includes(this.type);
  }

  /**
   * True if credential is a vault type.
   * @type {boolean}
   */
  get isVault() {
    return (
      this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC ||
      this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE ||
      this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP
    );
  }

  /**
   * True if credential is a generic vault type.
   * @type {boolean}
   */
  get isVaultGeneric() {
    return this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
  }

  /**
   * True if credential is a vault ssh cert type.
   * @type {boolean}
   */
  get isVaultSSHCertificate() {
    return this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE;
  }

  /**
   * True if credential is a vault ldap type.
   * @type {boolean}
   */
  get isVaultLDAP() {
    return this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP;
  }
}
