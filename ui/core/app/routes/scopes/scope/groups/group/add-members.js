import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';

export default class ScopesScopeGroupsGroupAddMembersRoute extends Route {
  // =services

  @service intl;
  @service notify;

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
    const group = this.modelFor('scopes.scope.groups.group');
    const { scopeID: scope_id } = group;
    return hash({
      group: this.modelFor('scopes.scope.groups.group'),
      users: this.store.query('user', { scope_id }),
    });
  }

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/groups/group/add-members/-header', {
      into: 'scopes/scope/groups/group',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/groups/group',
      outlet: 'actions',
    });

    this.render('-empty', {
      into: 'scopes/scope/groups/group',
      outlet: 'navigation',
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
  async addMembers(group, userIDs) {
    try {
      await group.addMembers(userIDs);
      await this.replaceWith('scopes.scope.groups.group.members');
      this.notify.success(this.intl.t('notifications.add-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Redirect to group members as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.groups.group.members');
  }
}
