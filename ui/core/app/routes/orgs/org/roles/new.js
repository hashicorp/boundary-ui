import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgRolesNewRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns a new unsaved role.
   * @return {Promise{RoleModel}}
   */
  model() {
    return this.store.createRecord('role');
  }

  // =actions

  /**
   * Rollback changes on role by destroying unsaved instance
   * and redirect to role index.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
    this.transitionTo('orgs.org.roles');
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
      this.transitionTo('orgs.org.roles.role', role);
      this.notify.success(this.intl.t('notify.role.create-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
