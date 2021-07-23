import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesCredentialLibraryRoute extends Route {
  // =methods

  /**
   * Load a credential-library using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_library_id
   * @return {CredentialLibraryModel}
   */
  async model({ credential_library_id }) {
    return this.store.findRecord('credential-library', credential_library_id, {
      reload: true,
    });
  }

  /**
   * Renders the credential library specific templates for header, navigation, and action page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/credential-stores/credential-store/credential-libraries/credential-library/-header',
      {
        into: 'scopes/scope/credential-stores/credential-store',
        outlet: 'header',
      }
    );

    this.render(
      'scopes/scope/credential-stores/credential-store/credential-libraries/credential-library/-navigation',
      {
        into: 'scopes/scope/credential-stores/credential-store',
        outlet: 'navigation',
      }
    );

    this.render(
      'scopes/scope/credential-stores/credential-store/credential-libraries/credential-library/-actions',
      {
        into: 'scopes/scope/credential-stores/credential-store',
        outlet: 'actions',
      }
    );
  }
}
