/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedAccountModel from '../generated/models/account';
import { computed } from '@ember/object';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
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
