import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreRoute extends Route {
  // =services

  @service store;

  /**
   * Load a specific credential store in current scope
   * @return {Promise[CredentialStoreModel]}
   */
  async model({ credential_store_id }) {
    return this.store.findRecord('credential-store', credential_store_id);
  }
}
