import GeneratedCredentialStoreModel from '../generated/models/credential-store';
import { equal } from '@ember/object/computed';

export const options = {
  types: ['static', 'vault'],
};
export default class CredentialStoreModel extends GeneratedCredentialStoreModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('type', 'vault') isVault;

  /**
   * @type {boolean}
   */
  @equal('type', 'static') isStatic;
}
