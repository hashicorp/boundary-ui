import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeRolesRoleGrantsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods
  
  /**
   * Save an role in current scope.
   * @param {RoleModel} role
   */
  @action
  async save(role) {
    try {
      await role.saveGrants();
      this.notify.success(
        this.intl.t('notify.save-success')
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
