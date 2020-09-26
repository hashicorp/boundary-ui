import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';
import loading from 'ember-loading/decorator';

export default class ScopesScopeGroupsGroupMembersRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns users associated with this group.
   * @return {Promise{group: GroupModel, members: Promise{[UserModel]}}}
   */
  model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    const group = this.modelFor('scopes.scope.groups.group');
    return hash({
      group,
      members: all(
        group.member_ids.map((id) =>
          this.store.findRecord('user', id, { adapterOptions: { scopeID } })
        )
      ),
    });
  }

  // =actions

  /**
   * Remove a member from the current role and redirect to members index.
   * @param {GroupModel} group
   * @param {UserModel} member
   */
  @action
  @loading
  async removeMember(group, member) {
    try {
      await group.removeMember(member.id);
      await this.refresh();
      this.notify.success(this.intl.t('notifications.remove-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
