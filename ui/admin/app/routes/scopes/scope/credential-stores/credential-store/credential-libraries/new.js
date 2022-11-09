import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved credential library in current credential store.
   * @return {CredentialLibraryModel}
   */
  model() {
    const { id: credential_store_id, type } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.createRecord('credential-library', {
      type,
      credential_store_id,
    });
  }
}
