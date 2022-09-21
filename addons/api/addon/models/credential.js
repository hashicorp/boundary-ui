import GeneratedCredentialModel from '../generated/models/credential';
import { equal } from '@ember/object/computed';

/**
 * Supported Credential types.
 */
export const types = ['username_password', 'ssh_private_key'];

export default class CredentialModel extends GeneratedCredentialModel {
  // =attributes
  /**
   * @type {boolean}
   */
  @equal('type', 'username_password') isUsernamePassword;

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !types.includes(this.type);
  }
}
