import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../decorators/confirm';

export default class ScopesScopeGroupsRoute extends Route {
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
   * Load all groups under current scope
   * @return {Promise[GroupModel]}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('group', { scope_id });
  }

  // =actions
  /**
   * Rollback changes on a group.
   * @param {GroupModel} group
   */
  @action
  cancel(group) {
    const { isNew } = group;
    group.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.groups');
  }

  /**
   * Save a group in current scope.
   * @param {GroupModel} group
   */
  @action
  @loading
  async save(group) {
    const { isNew } = group;
    try {
      await group.save();
      await this.transitionTo('scopes.scope.groups.group', group);
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
      throw error;
    }
  }

  /**
   * Delete a group in current scope and redirect to index
   * @param {GroupModel} group
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  async delete(group) {
    try {
      await group.destroyRecord();
      await this.replaceWith('scopes.scope.groups');
      this.refresh();
      this.notify.success(this.intl.t('notifications.delete-success'));
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
