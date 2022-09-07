import GeneratedCredentialModel from '../generated/models/credential';
import { equal } from '@ember/object/computed';

export default class CredentialModel extends GeneratedCredentialModel {
  // =attributes
  /**
   * @type {boolean}
   */
  @equal('type', 'username_password') isUsernamePassword;
}
