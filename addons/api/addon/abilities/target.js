import ModelAbility from './model';

/**
 * Generic ability provides abilities common to all models in the API.
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
