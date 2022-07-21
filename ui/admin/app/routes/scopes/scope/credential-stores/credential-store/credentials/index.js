import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsIndexRoute extends Route {
  // =methods

  setupController(controller) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    super.setupController(...arguments);
    controller.setProperties({ credentialStore });
  }
}
