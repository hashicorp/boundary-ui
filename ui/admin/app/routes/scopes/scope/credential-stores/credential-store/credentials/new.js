import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved credential in current credential store.
   * @return {CredentialModel}
   */
  model() {
    const { id: credential_store_id, type } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.createRecord('credential', {
      type,
      credential_store_id,
    });
  }
}
