import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeGroupsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Load all groups under current scope
   * @return {Promise[GroupModel]}
   */
  async model() {
    return this.store.findAll('group', this.scopeAdapterOptions());
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
  async save(group) {
    try {
      await group.save(this.scopeAdapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.save-success'));
      this.transitionTo('scopes.scope.groups.group', group);
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete a group in current scope and redirect to index
   * @param {GroupModel} group
   */
  @action
  async delete(group) {
    try {
      await group.destroyRecord(this.scopeAdapterOptions());
      this.refresh();
      this.transitionTo('scopes.scope.groups');
      this.notify.success(this.intl.t('notify.group.delete-success'));
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  scopeAdapterOptions() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const adapterOptions = { scopeID: scope_id };
    return { adapterOptions };
  }
}
