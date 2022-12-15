import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';
import { all } from 'rsvp';

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
    //unload managed groups to help with filtering based on scope
    await this.store.unloadAll('managed-group');
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
    const authMethods = scopeIDs?.length
      ? await this.resourceFilterStore.queryBy(
          'auth-method',
          {
            type: 'oidc',
            scope_id: scopeIDs,
          },
          {
            scope_id: 'global',
            recursive: true,
          }
        )
      : await this.resourceFilterStore.queryBy(
          'auth-method',
          {
            type: 'oidc',
          },
          {
            scope_id: 'global',
            recursive: true,
          }
        );

    await all(
      authMethods.map(({ id: auth_method_id }) => {
        return this.store.query('managed-group', { auth_method_id });
      })
    );
    const managedGroups = this.store.peekAll('managed-group');
    const users = scopeIDs?.length
      ? this.resourceFilterStore.queryBy(
          'user',
          {
            scope_id: scopeIDs,
          },
          {
            scope_id: 'global',
            recursive: true,
          }
        )
      : this.store.query('user', { scope_id: 'global', recursive: true });
    const groups = scopeIDs?.length
      ? this.resourceFilterStore.queryBy(
          'group',
          {
            scope_id: scopeIDs,
          },
          {
            scope_id: 'global',
            recursive: true,
          }
        )
      : this.store.query('group', { scope_id: 'global', recursive: true });
    return hash({
      role,
      scopes,
      users,
      groups,
      managedGroups,
    });
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
