import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsGroupMembersRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Empty out all users before loading members.
   */
  beforeModel() {
    this.store.unloadAll('user');
  }

  /**
   * Returns users associated with this group.
   * @return {Promise{[UserModel]}}
   */
  async model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    const group = this.modelFor('scopes.scope.groups.group');
    await this.store.findAll('user', { adapterOptions: { scopeID } });
    return group;
  }

  // =actions

  /**
   * Remove a member from the current role and redirect to members index.
   * @param {GroupModel} group
   * @param {UserModel} member
   */
  @action
  async removeMember(group, member) {
    try {
      await group.removeMember(member.id);
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
