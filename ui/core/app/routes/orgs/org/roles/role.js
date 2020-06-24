import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgRolesRoleRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Return a role with id
   * @param {object} params
   * @return {Promise{RoleModel}}
   */
  model({ role_id: id }) {
    return this.store.findRecord('role', id);
  }

  // =actions

  /**
   * Rollback changes on role.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
  }

  /**
   * Handle saving a role.
   * @param {RoleModel} role
   * @param {Event} e
   */
  @action
  async save(role) {
    try {
      await role.save();
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete role and redirect to roles index.
   * @param {RoleModel} role
   */
  @action
  async delete(role) {
    try {
      await role.destroyRecord();
      this.transitionTo('orgs.org.roles');
      this.notify.success(this.intl.t('notify.role.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
