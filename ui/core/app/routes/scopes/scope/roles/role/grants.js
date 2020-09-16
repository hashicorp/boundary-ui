import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeRolesRoleGrantsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Adds a new grant to the role at the beginning of the grants list.
   * Grant creation is not immediately permanent; users may rollback the change
   * via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {string} grantString
   */
  @action
  addGrant(role, grantString) {
    role.grants.unshiftObject({ value: grantString });
  }

  /**
   * Removes a grant from the role.  Grant removal is not immediately permanent;
   * users may rollback the change via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {FragmentString} grant
   */
  @action
  removeGrant(role, grant) {
    role.grants.removeFragment(grant);
  }

  /**
   * Save an role in current scope.
   * @param {RoleModel} role
   */
  @action
  async save(role) {
    try {
      await role.saveGrants();
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
