import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRolePrincipalsRoute extends Route {
  // =services
  @service intl;
  @service resourceFilterStore;

  // =methods

  /**
   * Returns users and groups associated with this role.
   * @param {object} params
   * @return {Promise{role, principals}}
   */
  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    // Fetch user and group principals.
    const users = await role.users;
    const groups = await role.groups;
    // Merge polymorphic principals.
    const principals = [...users, ...groups];

    return { role, principals };
  }

  // =actions

  /**
   * Remove a principal from the current role and redirect to principals index.
   * @param {UserModel, GroupModel} principal
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removePrincipal(principal) {
    const role = this.modelFor('scopes.scope.roles.role');
    await role.removePrincipal(principal.id);
    this.refresh();
  }
}
