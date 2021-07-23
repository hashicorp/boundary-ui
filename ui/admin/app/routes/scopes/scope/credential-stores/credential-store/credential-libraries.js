import Route from '@ember/routing/route';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesRoute extends Route {
  // =methods

  /**
   * Loads all credential libraries under the current credential store.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  model() {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.query('credential-library', { credential_store_id });
  }

  // =actions

  /**
   * Rollback changes on a credential library.
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  cancel(credentialLibrary) {
    const { isNew } = credentialLibrary;
    credentialLibrary.rollbackAttributes();
    if (isNew)
      this.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries'
      );
  }

  /**
   * Handle save of a credential library
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(credentialLibrary) {
    await credentialLibrary.save();
    await this.transitionTo(
      'scopes.scope.credential-stores.credential-store.credential-libraries'
    );
    this.refresh();
  }
}
