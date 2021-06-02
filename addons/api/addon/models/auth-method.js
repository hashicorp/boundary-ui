import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';
import { equal } from '@ember/object/computed';

/**
 * Enum ptions per auth method type and field.
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
  // =error attributes
  // These attributes exist solely to capture errors on nested fields.
  // See the application adapter's error normalization method for
  // more information.

  @attr('string', { readOnly: true }) attributes_state;
  @attr('string', { readOnly: true }) attributes_issuer;
  @attr('string', { readOnly: true }) attributes_client_id;
  @attr('string', { readOnly: true }) attributes_client_secret;
  @attr('string', { readOnly: true }) attributes_max_age;
  @attr('string', { readOnly: true }) attributes_api_url_prefix;
  @attr('string', { readOnly: true })
  attributes_disable_discovered_config_validation;
  @attr('string', { readOnly: true }) attributes_dry_run;
  @attr('string', { readOnly: true }) attributes_account_claim_maps;
  @attr('string', { readOnly: true }) attributes_claims_scopes;
  @attr('string', { readOnly: true }) attributes_signing_algorithms;
  @attr('string', { readOnly: true }) attributes_allowed_audiences;
  @attr('string', { readOnly: true }) attributes_idp_ca_certs;

  // =attributes

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentAuthMethodAttributesModel}
   */
  @fragment('fragment-auth-method-attributes', { defaultValue: {} }) attributes;

  /**
   * @type {boolean}
   */
  @equal('is_primary', true) isPrimary;

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
