import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgGroupsGroupRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Return a group with id
   * @param {object} params
   * @return {Promise{GroupModel}}
   */
  model({ group_id: id }) {
    return this.store.findRecord('group', id);
  }

  // =actions

  /**
   * Rollback changes on group.
   * @param {GroupModel} group
   */
  @action
  cancel(group) {
    group.rollbackAttributes();
  }

  /**
   * Handle saving a group.
   * @param {GroupModel} group
   * @param {Event} e
   */
  @action
  async save(group) {
    try {
      await group.save();
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete group and redirect to groups index.
   * @param {GroupModel} group
   */
  @action
  async delete(group) {
    try {
      await group.destroyRecord();
      this.transitionTo('orgs.org.groups');
      this.notify.success(this.intl.t('notify.group.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
