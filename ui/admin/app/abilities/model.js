import ModelAbility from 'api/abilities/model';
import { inject as service } from '@ember/service';

export default class OverrideModelAbility extends ModelAbility {
  // =services

  @service features;

  // =methods

  /**
   * If the capabilities feature flag is disabled, actions are always
   * authorized.  This mimics pre-capabilities behavior.
   */
  hasAuthorizedAction() {
    if (!this.features.isEnabled('capabilities')) return true;
    return super.hasAuthorizedAction(...arguments);
  }
}
