import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopePoliciesIndexController extends Controller {
  // =services

  //@service can;
  @service router;

  // =actions

  /**
   * Rollback changes on a policy.
   * @param {PolicyModel} policy
   */
  @action
  cancel(policy) {
    const { isNew } = policy;
    policy.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.policies');
  }

  /**
   * Save a policy in current scope.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(policy) {
    await policy.save();
    await this.router.transitionTo('scopes.scope.policies.policy', policy);

    await this.router.refresh();
  }
  /**
   * Deletes the policy.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(policy) {
    await policy.destroyRecord();
  }
}
