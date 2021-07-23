import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved credential library in current credential store.
   * @return {CredentialLibraryModel}
   */
  model() {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.createRecord('credential-library', {
      credential_store_id,
    });
  }

  /**
   * Renders new credential library specific templates for header, navigation,
   * and action page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/credential-stores/credential-store/credential-libraries/new/-header',
      {
        into: 'scopes/scope/credential-stores/credential-store',
        outlet: 'header',
      }
    );

    this.render('_empty', {
      into: 'scopes/scope/credential-stores/credential-store',
      outlet: 'navigation',
    });

    this.render('_empty', {
      into: 'scopes/scope/credential-stores/credential-store',
      outlet: 'actions',
    });
  }
}
