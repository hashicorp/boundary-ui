import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { attr } from '@ember-data/model';
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

  @attr('string', { readOnly: true, isNestedAttribute: true }) state;

  @attr('string', { isNestedAttribute: true }) issuer;

  @attr('string', { isNestedAttribute: true }) client_id;

  @attr('string', { isNestedAttribute: true }) client_secret;

  @attr('string', { readOnly: true, isNestedAttribute: true })
  client_secret_hmac;

  @attr('number', { isNestedAttribute: true }) max_age;

  @attr('string', { isNestedAttribute: true }) api_url_prefix;

  @attr('string', { readOnly: true, isNestedAttribute: true }) callback_url;

  @attr('boolean', { isNestedAttribute: true })
  disable_discovered_config_validation;

  @attr('boolean', { isNestedAttribute: true }) dry_run;

  @fragmentArray('fragment-auth-method-attributes-account-claim-map', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  account_claim_maps;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  claims_scopes;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  signing_algorithms;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  allowed_audiences;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  idp_ca_certs;

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
