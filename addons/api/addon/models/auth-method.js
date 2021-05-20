import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { fragment } from 'ember-data-model-fragments/attributes';
import { equal } from '@ember/object/computed';

export const signingAlgorithms = [
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
];

export const states = ['inactive', 'active-private', 'active-public'];

export default class AuthMethodModel extends GeneratedAuthMethodModel {
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
}
