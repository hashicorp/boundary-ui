import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgGroupsNewRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns a new unsaved group.
   * @return {Promise{GroupModel}}
   */
  model() {
    return this.store.createRecord('group');
  }

  // =actions

  /**
   * Rollback changes on group by destroying unsaved instance
   * and redirect to group index.
   * @param {GroupModel} group
   */
  @action
  cancel(group) {
    group.rollbackAttributes();
    this.transitionTo('orgs.org.groups');
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
      this.transitionTo('orgs.org.groups.group', group);
      this.notify.success(this.intl.t('notify.group.create-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
