import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesIndexRoute extends Route {
  // =methods

  setupController(controller) {
    const scope = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
