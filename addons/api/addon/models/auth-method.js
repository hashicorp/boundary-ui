/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { equal } from '@ember/object/computed';

export const TYPE_AUTH_METHOD_PASSWORD = 'password';
export const TYPE_AUTH_METHOD_OIDC = 'oidc';
export const TYPE_AUTH_METHOD_LDAP = 'ldap';

export const TYPES_AUTH_METHOD = Object.freeze([
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
]);

/**
 * Enum options per auth method type and field.
 */
export const options = {
  state: ['inactive', 'active-private', 'active-public'],
  oidc: {
    signing_algorithms: [
      'RS256',
      'RS384',
      'RS512',
      'ES256',
      'ES384',
      'ES512',
      'PS256',
      'PS384',
      'PS512',
      'EdDSA',
    ],
    account_claim_maps: {
      to: ['sub', 'name', 'email'],
    },
    prompts: ['consent', 'select_account', 'login'],
  },
  ldap: {
    account_attribute_maps: {
      to: ['fullName', 'email'],
    },
    dereference_aliases: {
      NeverDerefAliases: 'never',
      DerefInSearching: 'searching',
      DerefFindingBaseObj: 'finding',
      DerefAlways: 'always',
    },
  },
};

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('is_primary', true) isPrimary;

  options = options;

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
   * @type {boolean}
   */
  get isInactive() {
    return this.state === 'inactive';
  }

  /**
   * @type {boolean}
   */
  get isPrivate() {
    return this.state === 'active-private';
  }

  /**
   * @type {boolean}
   */
  get isPublic() {
    return this.state === 'active-public';
  }

  // =methods

  /**
   * Change the active and visibility state of an OIDC and LDAP auth method
   * given its ID.
   * For OIDC and LDAP auth methods only.
   * @param {[string]} state
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  changeState(state, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      state,
    };
    if (this.isOIDC) {
      defaultAdapterOptions.method = 'change-state';
    }
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
