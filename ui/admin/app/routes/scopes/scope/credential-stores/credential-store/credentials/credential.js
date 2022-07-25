import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsCredentialRoute extends Route {
  // =methods

  /**
   * Load a credential using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_id
   * @return {CredentialModel}
   */
  async model({ credential_id }) {
    return this.store.findRecord('credential', credential_id, {
      reload: true,
    });
  }
}
