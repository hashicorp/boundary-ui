import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeGroupsIndexController extends Controller {
  // =services
  @service can;
  @service router;

  // =actions

  /**
   * Rollback changes on a group.
   * @param {GroupModel} group
   */
  @action
  async cancel(group) {
    const { isNew } = group;
    group.rollbackAttributes();
    if (isNew) await this.router.transitionTo('scopes.scope.groups');
  }

  /**
   * Save a group in current scope.
   * @param {GroupModel} group
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(group) {
    await group.save();
    if (this.can.can('read model', group)) {
      await this.router.transitionTo('scopes.scope.groups.group', group);
    } else {
      await this.router.transitionTo('scopes.scope.groups');
    }
    await this.router.refresh();
  }

  /**
   * Delete a group in current scope and redirect to index
   * @param {GroupModel} group
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(group) {
    await group.destroyRecord();
    await this.router.replaceWith('scopes.scope.groups');
    await this.router.refresh();
  }

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
    await this.router.refresh();
  }
}
