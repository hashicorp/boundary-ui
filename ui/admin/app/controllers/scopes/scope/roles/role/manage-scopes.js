import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleManageScopesController extends Controller {
  // =services

  @service router;

  /**
   * Save grant scope IDs to current role via the API.
   * @param {RoleModel} role
   * @param {[string]} grantScopeIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async setGrantScopes(role, grantScopeIDs) {
    await role.setGrantScopes(grantScopeIDs);
    this.router.replaceWith('scopes.scope.roles.role.scopes');
  }

  /**
   * Redirect to role scopes as if nothing ever happened.
   */
  @action
  async cancel() {
    await this.router.replaceWith('scopes.scope.roles.role.scopes');
  }
}
