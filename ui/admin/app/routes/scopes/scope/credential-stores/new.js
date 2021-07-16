import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresNewRoute extends Route {
  // =methods
  /**
   * Creates a new unsaved credential-store
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('credential-store', {
      type: 'vault',
      scopeModel,
    });
  }
}
