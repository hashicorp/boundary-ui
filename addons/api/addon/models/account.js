import GeneratedAccountModel from '../generated/models/account';
import { fragment } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';

export default class AccountModel extends GeneratedAccountModel {

  // =attributes

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentAccountAttributesModel}
   */
  @fragment('fragment-account-attributes', { defaultValue: {} }) attributes;

  /**
   * Convenience for getting login_name attribute.
   * @type {string}
   */
  @computed('attributes.login_name')
  get username() {
    return this.attributes.login_name;
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
