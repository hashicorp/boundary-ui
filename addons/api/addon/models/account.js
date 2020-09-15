import GeneratedAccountModel from '../generated/models/account';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class AccountModel extends GeneratedAccountModel {

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentAccountAttributesModel}
   */
  @fragment('fragment-account-attributes', { defaultValue: {} }) attributes;

  // =methods

  /**
   * Save account password via the `set-password` method.
   * See serializer and adapter for more information.
   * @param {string} password
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  setPassword(password, options={ adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'set-password',
      password
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions
      }
    });
  }

}
