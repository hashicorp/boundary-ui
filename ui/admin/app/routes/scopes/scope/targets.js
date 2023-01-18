import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service session;
  @service can;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all targets under current scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      return this.store.query('target', { scope_id });
    }
  }

  // =actions

  /**
   * Rollback changes on a target.
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { isNew } = target;
    target.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.targets');
  }

  /**
   * Handle save.
   * @param {TargetModel} target
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(target) {
    console.log(target, 'in targetttt');
    await target.save();
    if (this.can.can('read model', target)) {
      await this.router.transitionTo('scopes.scope.targets.target', target);
    } else {
      await this.router.transitionTo('scopes.scope.targets');
    }
    this.refresh();
  }

  /**
   * save target with filters based on egress/ingress toggle
   * @param {object} target
   * @param {boolean} egressEnabled
   * @return {Promise}
   */
  @action
  @loading
  async saveWithToggles(target, egressEnabled = true) {
    // retain filter values in case of save failure
    console.log(egressEnabled, 'enabledddd');
    const { egress_worker_filter, worker_filter } = target;
    console.log(
      egress_worker_filter,
      'enabledddd',
      worker_filter,
      egressEnabled
    );

    // if the filter toggles are off, clear the filter fields
    if (!egressEnabled) {
      target.egress_worker_filter = '';
    }
    //this field becomes empty as they are deprecated
    //and target is updated to new filters above
    target.worker_filter = '';

    try {
      await this.save(target);
    } catch (e) {
      // replace values on error
      target.egress_worker_filter = egress_worker_filter;
      target.worker_filter = worker_filter;
      // rethrow the error in order to notify the user
      throw e;
    }
  }
  /**
   * Deletes a target and redirects to targets index.
   * @param {TargetModel} target
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(target) {
    await target.destroyRecord();
    await this.router.replaceWith('scopes.scope.targets');
    this.refresh();
  }
}
