import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../decorators/confirm';

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
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('user', { scope_id });
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
  @loading
  async save(user) {
    const { isNew } = user;
    try {
      await user.save();
      await this.transitionTo('scopes.scope.users.user', user);
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
      throw error;
    }
  }

  /**
   * Delete user in current scope and redirect to index.
   * @param {UserModel} user
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  async delete(user) {
    try {
      await user.destroyRecord();
      await this.replaceWith('scopes.scope.users');
      this.refresh();
      this.notify.success(this.intl.t('notifications.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
