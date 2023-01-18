import GeneratedCredentialLibraryModel from '../generated/models/credential-library';

/**
 * Enum options for credential library.
 */
export const options = {
  http_method: ['GET', 'POST'],
};

export const VAULT = 'vault';
export const VAULT_GENERIC = 'vault-generic';
export const VAULT_SSH_CERT = 'vault-ssh-cert';

/**
 * Supported Credential Library types.
 */
export const types = [VAULT_GENERIC, VAULT_SSH_CERT];

export default class CredentialLibraryModel extends GeneratedCredentialLibraryModel {
  // =attributes

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !types.includes(this.type);
  }

  /**
   * True if credential is a vault type.
   * @type {boolean}
   */
  get isVault() {
    return this.type === VAULT_GENERIC || this.type === VAULT;
  }

  /**
   * True if credential is a vault ssh cert type.
   * @type {boolean}
   */
  get isVaultSSHCert() {
    return this.type === VAULT_SSH_CERT;
  }
}
