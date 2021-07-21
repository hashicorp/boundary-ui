import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesRoute extends Route {
  // =methods

  /**
   * Loads all credential libraries under the current credential store.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  model() {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.query('credential-library', { credential_store_id });
  }
}
