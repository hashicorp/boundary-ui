import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleGrantsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =actions

  /**
   * Adds a new grant to the role at the beginning of the grants list.
   * Grant creation is not immediately permanent; users may rollback the change
   * via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {string} grantString
   */
  @action
  addGrant(role, grantString) {
    role.grant_strings.unshiftObject(grantString);
  }

  /**
   * Removes a grant from the role.  Grant removal is not immediately permanent;
   * users may rollback the change via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {string} grantString
   */
  @action
  removeGrant(role, grantString) {
    role.grant_strings.removeObject(grantString);
  }

  /**
   * Save an role in current scope.
   * @param {RoleModel} role
   * @param {[string]} grantStrings
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async save(role, grantStrings) {
    await role.saveGrantStrings(grantStrings);
  }
}
