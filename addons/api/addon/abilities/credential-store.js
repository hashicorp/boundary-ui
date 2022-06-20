import ModelAbility from './model';

/**
 * Provides abilities for credential store.
 */
export default class CredentialStoreAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" credential store types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isStatic && this.hasAuthorizedAction('read');
  }
}
