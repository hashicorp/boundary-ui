import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { equal } from '@ember/object/computed';

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('is_primary', true) isPrimary;

  /**
   * @type {boolean}
   */
  get isPassword() {
    return this.type === 'password';
  }

  /**
   * @type {boolean}
   */
  get isOIDC() {
    return this.type === 'oidc';
  }
}
