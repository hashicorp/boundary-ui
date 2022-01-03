import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesRoute extends Route {
  // =methods
  @service can;

  /**
   * Loads all credential libraries under the current credential store.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  model() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    const { id: credential_store_id } = credentialStore;
    if (
      this.can.can('list collection', credentialStore, {
        collection: 'credential-libraries',
      })
    ) {
      return this.store.query('credential-library', { credential_store_id });
    }
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
    if (this.can.can('read model', credentialLibrary)) {
      await this.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries.credential-library',
        credentialLibrary
      );
    } else {
      await this.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries'
      );
    }
    this.refresh();
  }

  /**
   * Handle delete of a credential library
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(credentialLibrary) {
    await credentialLibrary.destroyRecord();
    await this.replaceWith(
      'scopes.scope.credential-stores.credential-store.credential-libraries'
    );
    this.refresh();
  }
}
