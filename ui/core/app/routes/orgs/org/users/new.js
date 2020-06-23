import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgUsersNewRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns a new unsaved user.
   * @return {Promise{UserModel}}
   */
  model() {
    return this.store.createRecord('user');
  }

  // =actions

  /**
   * Rollback changes on user to destroy unsaved instance
   * and redirect to users index.
   * @param {UserModel} user
   */
  @action
  cancel(user) {
    user.rollbackAttributes();
    this.transitionTo('orgs.org.users');
  }

  /**
   * Handle saving a user.
   * @param {UserModel} user
   * @param {Event} e
   */
  @action
  async save(user) {
    try {
      await user.save();
      this.transitionTo('orgs.org.users.user', user);
      this.notify.success(this.intl.t('notify.user.create-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
