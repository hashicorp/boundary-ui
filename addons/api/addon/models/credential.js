import GeneratedCredentialModel from '../generated/models/credential';

/**
 * Supported Credential types.
 */
export const types = ['username_password', 'ssh_private_key'];

export default class CredentialModel extends GeneratedCredentialModel {
  // =attributes
  /**
   * All Credentials are prefixed with "cred" and are considered
   * static due to their relation with Static Credential Stores.
   * 
   * True if credential starts with the "cred" prefix.
   * @type {boolean}
   */
  get isStatic() {
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
