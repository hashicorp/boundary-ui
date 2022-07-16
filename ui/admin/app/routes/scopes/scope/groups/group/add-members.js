import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeGroupsGroupAddMembersRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service router;

  // =methods

  /**
   * Emtpy out any previously loaded users.
   */
  beforeModel() {
    this.store.unloadAll('user');
  }

  /**
   * Loads all users and returns them with the group.
   * @return {Promise{GroupModel, [UserModel]}}
   */
  model() {
    return hash({
      group: this.modelFor('scopes.scope.groups.group'),
      // load all users from all scopes
      users: this.store.query('user', { scope_id: 'global', recursive: true }),
    });
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
}
