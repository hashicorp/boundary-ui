import CredentialLibraryAbility from 'api/abilities/credential-library';
import { inject as service } from '@ember/service';

export default class OverrideCredentialLibraryAbility extends CredentialLibraryAbility {
  // =service
  @service features;

  /**
   * This override ensures that vault ssh cert may be read only if the
   * credential-library-vault-ssh-certificate feature flag is enabled.
   * All other types are subject to the standard logic found in the api addon.
   */
  get canRead() {
    return this.features.isEnabled(
      'credential-library-vault-ssh-certificate'
    ) || !this.model.isVaultSSHCert
      ? super.canRead
      : false;
  }
}
