import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeUsersRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Load all users under current scope.
   * @return {Promise{[UserModel]}}
   */
  async model() {
    return this.store.findAll('user', this.scopeAdapterOptions());
  }

  // =actions
  /**
   * Rollback changes on user.
   * @param {UserModel} user
   */
  @action
  cancel(user) {
    const { isNew } = user;
    user.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.users');
  }

  /**
   * Save a user in current scope.
   * @param {UserModel} user
   * @param {Event} e
   */
  @action
  async save(user) {
    try {
      await user.save(this.scopeAdapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.save-success'));
      this.transitionTo('scopes.scope.users.user', user);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete user in current scope and redirect to index.
   * @param {UserModel} user
   */
  @action
  async delete(user) {
    try {
      await user.destroyRecord(this.scopeAdapterOptions());
      this.refresh();
      this.transitionTo('scopes.scope.users');
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  scopeAdapterOptions() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const adapterOptions = { scopeID: scope_id };
    return { adapterOptions };
  }
}
