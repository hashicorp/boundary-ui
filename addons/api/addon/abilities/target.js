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

  /**
   * @type {boolean}
   */
  get canAddHostSources() {
    return this.hasAuthorizedAction('add-host-sources');
  }

  /**
   * @type {boolean}
   */
  get canRemoveHostSources() {
    return this.hasAuthorizedAction('remove-host-sources');
  }

  /**
   * @type {boolean}
   */
  get canAddCredentialSources() {
    return this.hasAuthorizedAction('add-credential-sources');
  }

  /**
   * @type {boolean}
   */
  get canRemoveCredentialSources() {
    return this.hasAuthorizedAction('remove-credential-sources');
  }
}
