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
   * @return {Promise{RoleModel}}
   */
  async model() {
    const role = this.modelFor('scopes.scope.roles.role');

    // Gather user, group, managedGroup IDs as separate arrays, since these
    // will be queried in separate API queries.
    const userIDs = role.principals
      .filter(({ type }) => type === 'user')
      .map(({ principal_id }) => principal_id);
    const groupIDs = role.principals
      .filter(({ type }) => type === 'group')
      .map(({ principal_id }) => principal_id);
    const managedGroupIDs = role.principals
      .filter(({ type }) => type === 'managed-group')
      .map(({ principal_id }) => principal_id);
    console.log(managedGroupIDs, 'route');
    // Query for users.
    const users = userIDs?.length
      ? (
          await this.resourceFilterStore.queryBy(
            'user',
            { id: userIDs },
            { scope_id: 'global', recursive: true }
          )
        ).map((model) => model)
      : [];
    // Query for groups.
    const groups = groupIDs?.length
      ? (
          await this.resourceFilterStore.queryBy(
            'group',
            { id: groupIDs },
            { scope_id: 'global', recursive: true }
          )
        ).map((model) => model)
      : [];
    // Query for managed Groups.

    const managedGroups = managedGroupIDs?.length
      ? (
          await this.resourceFilterStore.queryBy(
            'managed-group',
            { id: managedGroupIDs },
            { scope_id: 'global', recursive: true }
          )
        ).map((model) => model)
      : [];

    // const managedGroups = await this.store.query('managed-group', {
    //   scope_id: 'global',
    //   recursive: true,
    // });

    console.log(managedGroups, 'mm');

    console.log(managedGroups, 'managedGroupsmanagedGroupsmanagedGroups');
    return {
      role,
      principals: [...users, ...groups, ...managedGroups],
    };
  }

  // =actions

  /**
   * Remove a principal from the current role and redirect to principals index.
   * @param {UserModel, GroupModel, ManagedGroup} principal
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
