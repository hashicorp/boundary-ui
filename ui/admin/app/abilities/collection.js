import CollectionAbility from 'api/abilities/collection';
import { inject as service } from '@ember/service';

export default class OverrideCollectionAbility extends CollectionAbility {
  // =services

  @service features;

  // =permissions

  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present.
   * @type {boolean}
   */
  get canNavigate() {
    return this.canList || this.canCreate;
  }

  // =methods

  /**
   * If the capabilities feature flag is disabled, actions are always
   * authorized.  This mimics pre-capabilities behavior.
   */
  hasAuthorizedCollectionAction() {
    if (!this.features.isEnabled('capabilities')) return true;
    return super.hasAuthorizedCollectionAction(...arguments);
  }
}
