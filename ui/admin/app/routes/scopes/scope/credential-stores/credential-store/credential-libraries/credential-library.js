import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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

  /**
   * Copies the contents of array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {credentialLibraryModel} credentialLibrary
   */
  @action
  edit(credentialLibrary) {
    const { critical_options, extensions } = credentialLibrary;
    credentialLibrary.critical_options = structuredClone(critical_options);
    credentialLibrary.extensions = structuredClone(extensions);
  }
}
