import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsRoute extends Route {
  // =services

  @service can;
  @service router;

  // =methods

  /**
   * Loads all credential under the current credential store.
   * @return {Promise{[CredentialModel]}}
   */
  model() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    const { id: credential_store_id } = credentialStore;
    if (
      this.can.can('list model', credentialStore, {
        collection: 'credentials',
      })
    ) {
      return this.store.query('credential', { credential_store_id });
    }
  }

    // =actions

  /**
   * Rollback changes on a credential.
   * @param {CredentialModel} credential
   */
   @action
   cancel(credential) {
     const { isNew } = credential;
     credential.rollbackAttributes();
     if (isNew)
       this.router.transitionTo(
         'scopes.scope.credential-stores.credential-store.credentials'
       );
   }
 

    /**
   * Handle save of a credential
   * @param {CredentialModel} credential
   */
     @action
     @loading
     @notifyError(({ message }) => message)
     @notifySuccess(({ isNew }) =>
       isNew ? 'notifications.create-success' : 'notifications.save-success'
     )
     async save(credential) {
       await credential.save();
       if (this.can.can('read model', credential)) {
         await this.router.transitionTo(
           'scopes.scope.credential-stores.credential-store.credentials.credential',
           credential
         );
       } else {
         await this.router.transitionTo(
           'scopes.scope.credential-stores.credential-store.credentials'
         );
       }
       this.refresh();
     }
  /**
   * Handle delete of a credential
   * @param {Credential} credential
   */
   @action
   @loading
   @confirm('questions.delete-confirm')
   @notifyError(({ message }) => message, { catch: true })
   @notifySuccess('notifications.delete-success')
   async deleteCredential(credential) {
     await credential.destroyRecord();
     await this.router.replaceWith(
       'scopes.scope.credential-stores.credential-store.credentials'
     );
     this.refresh();
   }
}
