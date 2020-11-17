import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../../../decorators/confirm';
import { notifySuccess, notifyError } from '../../../../../decorators/notify';

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
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeMember(group, member) {
    await group.removeMember(member.id);
    this.refresh();
  }
}
