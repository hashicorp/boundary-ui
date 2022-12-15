import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { all } from 'rsvp';

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
  /**
   * Empty out any previously loaded managed groups.
   */
  beforeModel() {
    this.store.unloadAll('managed-group');
  }
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
      .filter(({ type }) => type === 'managed group')
      .map(({ principal_id }) => principal_id);
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
    const authMethods = await this.resourceFilterStore.queryBy(
      'auth-method',
      { type: 'oidc' },
      {
        scope_id: 'global',
        recursive: true,
      }
    );
    managedGroupIDs?.length
      ? await all(
          authMethods.map(({ id: auth_method_id }) =>
            this.resourceFilterStore.queryBy(
              'managed-group',
              { id: managedGroupIDs },
              { auth_method_id }
            )
          )
        )
      : [];
    const managedGroups = this.store
      .peekAll('managed-group')
      .map((model) => model);

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
