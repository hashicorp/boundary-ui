import GeneratedAuthMethodModel from '../generated/models/auth-method';

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  // =attributes

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
