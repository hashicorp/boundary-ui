import Route from '@ember/routing/route';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeCredentialStoresRoute extends Route {
  // =methods

  /**
   * Load all credential stores under current scope
   * @returns {Promise[CredentialStoreModel]}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('credential-store', { scope_id });
  }

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
    await this.transitionTo(
      'scopes.scope.credential-stores.credential-store',
      credentialStore
    );
    this.refresh();
  }

  /**
   * Rollback changes on credential stores.
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  cancel(credentialStore) {
    const { isNew } = credentialStore;
    credentialStore.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.credential-stores');
  }
}
