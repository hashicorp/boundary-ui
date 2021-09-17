import ModelAbility from './model';

/**
 * Provides a `connect` ability for targets.
 */
export default class TargetAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canConnect() {
    return this.hasAuthorizedAction('authorize-session');
  }
}
