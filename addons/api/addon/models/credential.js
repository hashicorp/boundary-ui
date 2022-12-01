import GeneratedCredentialModel from '../generated/models/credential';
// import { inject as service } from '@ember/service';

/**
 * Supported Credential types.
 */
export const types = ['username_password', 'ssh_private_key'];

export default class CredentialModel extends GeneratedCredentialModel {
  // =services
  // @service features;

  // =attributes
  // types = this.features.isEnabled('json-credentials')
  //   ? ['username_password', 'ssh_private_key', 'json']
  //   : ['username_password', 'ssh_private_key'];

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
