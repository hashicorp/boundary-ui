import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeGroupsGroupAddMembersRoute extends Route {
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
   * Loads all users and returns them with the group.
   * @return {Promise{GroupModel, [UserModel]}}
   */
  model() {
    const group = this.modelFor('scopes.scope.groups.group');
    // filter out projects, since the user resource exists only on org and above
    const scopes = this.store
      .peekAll('scope')
      .filter((scope) => !scope.isProject)
      .toArray();
    const scopeIDs = this.scope?.map((scope) => scope.id);
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
    return hash({ group, users, scopes });
  }

  // =actions

  /**
   * Adds members to the group and saves, replaces with the members index
   * route, and notifies the user of success or error.
   * @param {GroupModel} group
   * @param {[string]} userIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addMembers(group, userIDs) {
    await group.addMembers(userIDs);
    await this.router.replaceWith('scopes.scope.groups.group.members');
  }

  /**
   * Redirect to group members as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.groups.group.members');
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
