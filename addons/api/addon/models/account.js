import GeneratedAccountModel from '../generated/models/account';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';

export default class AccountModel extends GeneratedAccountModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('type', 'password') isPassword;

  /**
   * @type {boolean}
   */
  @equal('type', 'oidc') isOIDC;

  /**
   * Convenience for getting username in account.
   * @type {string}
   */
  @computed('{email,full_name,login_name}')
  get accountName() {
    const { email, full_name, login_name } = this;
    return email || full_name || login_name;
  }

  // =methods

  /**
   * Save account password via the `set-password` method.
   * See serializer and adapter for more information.
   * @param {string} password
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  setPassword(password, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'set-password',
      password,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Update account password via the `change-password` method.
   * See serializer and adapter for more information.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  changePassword(
    currentPassword,
    newPassword,
    options = { adapterOptions: {} }
  ) {
    const defaultAdapterOptions = {
      method: 'change-password',
      currentPassword,
      newPassword,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
