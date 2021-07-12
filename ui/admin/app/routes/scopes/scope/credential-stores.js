import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresRoute extends Route {
  /**
   * Load all credential stores under current scope
   * @returns {Promise[CredentialStoreModel]}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('credential-store', { scope_id });
  }
}
