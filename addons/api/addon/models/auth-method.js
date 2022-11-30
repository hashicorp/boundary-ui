import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { equal } from '@ember/object/computed';

/**
 * Enum options per auth method type and field.
 */
export const options = {
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
    state: ['inactive', 'active-private', 'active-public'],
    account_claim_maps: {
      to: ['sub', 'name', 'email'],
    },
  },
};

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  // =attributes

  @fragmentArray('fragment-auth-method-attributes-account-claim-map', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  account_claim_maps;

  /**
   * @type {boolean}
   */
  @equal('is_primary', true) isPrimary;

  options = options;

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
   * Change the active and visibility state of an OIDC auth method
   * given its ID.
   * For OIDC auth methods only.
   * @param {[string]} state
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  changeState(state, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'change-state',
      state,
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
