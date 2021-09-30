import ModelAbility from './model';

/**
 * Provides abilities for roles.
 */
export default class RoleAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canSetGrants() {
    return this.hasAuthorizedAction('set-grants');
  }
}
