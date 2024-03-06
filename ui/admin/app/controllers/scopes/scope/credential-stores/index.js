import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeCredentialStoresIndexController extends Controller {
  // =services

  @service can;
  @service router;

  // =actions

  /**
   * Handle save
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(credentialStore) {
    await credentialStore.save();
    if (this.can.can('read model', credentialStore)) {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store',
        credentialStore,
      );
    } else {
      await await this.router.transitionTo('scopes.scope.credential-stores');
    }
    await this.router.refresh();
  }

  /**
   * Rollback changes on credential stores.
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  async cancel(credentialStore) {
    const { isNew } = credentialStore;
    credentialStore.rollbackAttributes();
    if (isNew) {
      await this.router.transitionTo('scopes.scope.credential-stores');
    }
  }

  /**
   * Deletes the credential store and redirects to index
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(credentialStore) {
    await credentialStore.destroyRecord();
    await this.router.replaceWith('scopes.scope.credential-stores');
    await this.router.refresh();
  }

  /**
   * Update type of credential store
   * @param {string} type
   */
  @action
  async changeType(type) {
    await this.router.replaceWith({ queryParams: { type } });
  }
}
