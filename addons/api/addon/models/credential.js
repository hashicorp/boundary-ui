import GeneratedCredentialModel from '../generated/models/credential';

/**
 * Supported Credential types.
 */
export const types = ['username_password', 'ssh_private_key'];

export default class CredentialModel extends GeneratedCredentialModel {
  // =attributes
  /**
   * True if credential starts with the "cred" prefix.
   * @type {boolean}
   */
  get isStaticCredential() {
    return this.id.startsWith('cred');
  }

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !types.includes(this.type);
  }
}
