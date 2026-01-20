/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedUserModel from '../generated/models/user';
import { attr } from '@ember-data/model';
import { computed } from '@ember/object';
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

  /**
   * Represents the user's primary account email, if any.
   * @type {string}
   */
  @attr('string', { readOnly: true }) email;

  /**
   * Represents the user's primary account full_name, if any.
   * @type {string}
   */
  @attr('string', { readOnly: true }) full_name;

  /**
   * Represents the user's primary account login_name, if any.
   * @type {string}
   */
  @attr('string', { readOnly: true }) login_name;

  /**
   * Convenience for getting a reasonable string that names the account.
   * There are many options, so we fallback in order of precedence.
   * @type {string}
   */
  @computed('email', 'full_name', 'login_name')
  get accountName() {
    const { email, full_name, login_name } = this;
    return email || full_name || login_name;
  }

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
