import GeneratedCredentialLibraryModel from '../generated/models/credential-library';

/**
 * Enum options for credential library.
 */
export const options = {
  http_method: ['GET', 'POST'],
};

export const TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC = 'vault-generic';
export const TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT = 'vault-ssh-cert';

/**
 * Supported Credential Library types.
 */
export const TYPES_CREDENTIAL_LIBRARY = Object.freeze([
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT,
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
      this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT
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
  get isVaultSSHCert() {
    return this.type === TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERT;
  }
}
