import ModelAbility from './model';

/**
 * Provides abilities for host sets.
 */
export default class HostSetAbility extends ModelAbility {
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

  /**
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
