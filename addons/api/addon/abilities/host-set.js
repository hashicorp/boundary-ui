import ModelAbility from './model';

/**
 * Provides abilities for host sets.
 */
export default class UserAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canAddHosts() {
    return this.hasAuthorizedAction('add-hosts');
  }

  /**
   * @type {boolean}
   */
  get canRemoveHosts() {
    return this.hasAuthorizedAction('remove-hosts');
  }
}
