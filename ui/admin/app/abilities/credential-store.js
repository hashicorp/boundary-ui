import CredentialStoreAbility from 'api/abilities/credential-store';

export default class OverrideCredentialStoreAbility extends CredentialStoreAbility {
  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present, except in the following case.
   * @type {boolean}
   */
  get canNavigate() {
    const { isVault } = this.model;
    console.log(isVault, 'IS VAULT', this.collection)
    const isCredentialStoresCollection = this.collection === 'credential-stores';
    const isDynamicHostsNavigation = isVault && isCredentialStoresCollection;
    return isDynamicHostsNavigation && (this.canList || this.canCreate);
  }
}