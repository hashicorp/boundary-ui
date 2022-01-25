import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreRoute extends Route {
  /**
   * Load a specific credential store in current scope
   * @return {Promise[CredentialStoreModel]}
   */
  async model({ credential_store_id }) {
    return this.store.findRecord('credential-store', credential_store_id);
  }
}
