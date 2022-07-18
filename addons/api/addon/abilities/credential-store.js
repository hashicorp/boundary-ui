import ModelAbility from './model';
import { inject as service } from '@ember/service';
/**
 * Provides abilities for credential store.
 */
export default class CredentialStoreAbility extends ModelAbility {
  // =services

  @service features;

  // =permissions

  /**
   * Only "known" credential store types may be read.
   * @type {boolean}
   */
  get canRead() {
    return this.features.isEnabled('static-credentials')
      ? this.hasAuthorizedAction('read')
      : !this.model.isStatic && this.hasAuthorizedAction('read');
  }
}
