import GeneratedUserModel from '../generated/models/user';
import { attr } from '@ember-data/model';
import { A } from '@ember/array';

export default class UserModel extends GeneratedUserModel {

  // =attributes

  /**
   * Accounts is read-only under normal circumstances.  But accounts can
   * be persisted via calls to `addAccounts()` or `removeAccounts()`.
   */
  @attr({
    readOnly: true,
    defaultValue: () => A(),
    emptyArrayIfMissing: true,
  })
  account_ids;

  // =methods

  /**
   * Adds accounts via the `add-accounts` method.
   * See serializer and adapter for more information.
   * @param {[string]} accountIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addAccounts(accountIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-accounts',
      accountIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Remove accounts via the `remove-accounts` method.
   * See serializer and adapter for more information.
   * @param {[string]} accountIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeAccounts(accountIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-accounts',
      accountIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Remove a single account via the `remove-accounts` method.
   * @param {number} accountID
   * @param {object} options
   * @return {Promise}
   */
  removeAccount(accountID, options) {
    return this.removeAccounts([accountID], options);
  }

}
