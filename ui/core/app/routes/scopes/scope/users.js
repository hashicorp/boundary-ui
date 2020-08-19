import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeUsersRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Load all users under current scope.
   * @return {Promise{[UserModel]}}
   */
  async model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findAll('user', { adapterOptions: { scopeID } });
  }

  // =actions
  /**
   * Rollback changes on an user.
   * @param {UserModel} user
   */
  @action
  cancel(user) {
    const { isNew } = user;
    user.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.users');
  }

  /**
   * Save an user in current scope.
   * @param {UserModel} user
   * @param {Event} e
   */
  @action
  async save(user) {
    const { isNew } = user;
    try {
      await user.save();
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notify.create-success' : 'notify.save-success')
      );
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
      await user.destroyRecord();
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
      this.transitionTo('scopes.scope.users');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
