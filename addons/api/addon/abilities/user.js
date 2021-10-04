import ModelAbility from './model';

/**
 * Provides abilities for users.
 */
export default class UserAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canAddAccounts() {
    return this.hasAuthorizedAction('add-accounts');
  }

  /**
   * @type {boolean}
   */
  get canRemoveAccounts() {
    return this.hasAuthorizedAction('remove-accounts');
  }
}
