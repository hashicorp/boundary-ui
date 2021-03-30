import GeneratedAuthMethodModel from '../generated/models/auth-method';
import { equal } from '@ember/object/computed';

export default class AuthMethodModel extends GeneratedAuthMethodModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('primary', true) isPrimary;
}
