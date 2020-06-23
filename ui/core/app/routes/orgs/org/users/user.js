import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgUsersUserRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns a user by id.
   * @param {object} params
   * @return {Promise{UserModel}}
   */
  model({ user_id: id }) {
    return this.store.findRecord('user', id);
  }

  // =actions

  /**
   * Rollback changes on user.
   * @param {UserModel} user
   */
  @action
  cancel(user) {
    user.rollbackAttributes();
  }

  /**
   * Handle save user.
   * @param {UserModel} user
   * @param {Event} e
   */
  @action
  async save(user) {
    try {
      await user.save();
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Deletes the user and redirects to index.
   * @param {UserModel} user
   */
  @action
  async delete(user) {
    try {
      await user.destroyRecord();
      this.transitionTo('orgs.org.users');
      this.notify.success(this.intl.t('notify.user.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
