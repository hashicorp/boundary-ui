/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedAccountModel from '../generated/models/account';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
  TYPES_AUTH_METHOD,
} from './auth-method';

export default class AccountModel extends GeneratedAccountModel {
  // =attributes

  /**
   * @type {boolean}
   */
  get isPassword() {
    return this.type === TYPE_AUTH_METHOD_PASSWORD;
  }

  /**
   * @type {boolean}
   */
  get isOIDC() {
    return this.type === TYPE_AUTH_METHOD_OIDC;
  }

  /**
   * @type {boolean}
   */
  get isLDAP() {
    return this.type === TYPE_AUTH_METHOD_LDAP;
  }

  /**
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_AUTH_METHOD.includes(this.type);
  }

  /**
   * Convenience for getting username in account.
   * @type {string}
   */
  get accountName() {
    const { email, full_name, login_name, subject } = this;
    return email || full_name || login_name || subject;
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
    options = { adapterOptions: {} },
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
