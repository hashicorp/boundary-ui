import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeRolesRoleAddPrincipalsRoute extends Route {
  // =services

  @service intl;
  @service router;
  @service store;
  @service resourceFilterStore;

  // =attributes

  @resourceFilter({
    allowed: (route) => route.store.peekAll('scope').toArray(),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  scope;

  // =methods

  /**
   * Preload all scopes recursively, but allow this to fail.
   */
  async beforeModel() {
    await this.store
      .query('scope', { scope_id: 'global', recursive: true })
      .catch(() => {});
  }

  /**
   * Returns the current role, all users, and all groups
   * @return {{role: RoleModel, users: [UserModel], groups: [GroupModel]}}
   */
  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    const scopes = this.store.peekAll('scope').toArray();
    const scopeIDs = this.scope?.map((scope) => scope.id);

    let users = await role.usersFromAllScopes;
    let groups = await role.groupsFromAllScopes;
    let authMethods = await role.authMethodModelsFromAllScopes;
    let managedGroups = await role.managedGroupsByScopes();

    //filter out the resources based on scopes
    if (scopeIDs?.length) {
      users = users.filter((i) => scopeIDs.includes(i.scopeID));
      groups = groups.filter((i) => scopeIDs.includes(i.scopeID));
      const filteredAuthIDs = authMethods
        .filter((i) => scopeIDs.includes(i.scopeID))
        .map((authRecord) => authRecord.id);
      if (filteredAuthIDs?.length) {
        managedGroups = await role.managedGroupsByScopes(filteredAuthIDs);
      } else {
        managedGroups = [];
      }
    }

    return {
      role,
      scopes,
      users,
      groups,
      managedGroups,
    };
  }

  // =actions

  /**
   * Save principal IDs to current role via the API.
   * @param {RoleModel} role
   * @param {[string]} principalIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addPrincipals(role, principalIDs) {
    await role.addPrincipals(principalIDs);
    this.router.replaceWith('scopes.scope.roles.role.principals');
  }

  /**
   * Redirect to role principals as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.roles.role.principals');
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.scope = [];
  }
}
