import ModelAbility from './model';
/**
 * Provides abilities for credential.
 */
export default class CredentialLibaryAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" credential libary types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
