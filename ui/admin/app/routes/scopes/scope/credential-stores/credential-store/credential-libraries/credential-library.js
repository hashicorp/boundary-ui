import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesCredentialLibraryRoute extends Route {
  // =services

  @service store;

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
}
