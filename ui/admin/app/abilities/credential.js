import CredentialAbility from 'api/abilities/credential';
import { inject as service } from '@ember/service';

export default class OverrideCredentialAbility extends CredentialAbility {
  // =service
  @service features;

  /**
   * This override ensures that JSON credentials may be read only if the
   * json-credentials feature flag is enabled.  All other types are subject
   * to the standard logic found in the api addon.
   */
  get canRead() {
    return this.features.isEnabled('json-credentials') || !this.model.isJSON
      ? super.canRead
      : false;
  }
}
