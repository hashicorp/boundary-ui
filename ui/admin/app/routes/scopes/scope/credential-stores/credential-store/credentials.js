import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsRoute extends Route {
  // =services

  @service can;
  @service router;

  // =methods

  /**
   * Loads all credential libraries under the current credential store.
   * @return {Promise{[CredentialModel]}}
   */
  model() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    const { id: credential_store_id } = credentialStore;
    if (
      this.can.can('list model', credentialStore, {
        collection: 'credentials',
      })
    ) {
      return this.store.query('credential', { credential_store_id });
    }
  }
}
