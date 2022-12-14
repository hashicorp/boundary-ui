import CredentialAbility from 'api/abilities/credential';
import { inject as service } from '@ember/service';

export default class OverrideCredentialAbility extends CredentialAbility {
  // =service
  @service features;

  get canRead() {
    return this.features.isEnabled('json-credentials') ||
      this.model.type !== 'json'
      ? super.canRead
      : false;
  }
}
