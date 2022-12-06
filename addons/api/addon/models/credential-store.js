import GeneratedCredentialStoreModel from '../generated/models/credential-store';
import { equal } from '@ember/object/computed';

export const options = {
  static: {
    icon: '',
  },
  vault: {
    icon: 'vault',
  },
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
