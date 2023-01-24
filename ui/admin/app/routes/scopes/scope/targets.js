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
  @service confirm;

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
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(target) {
    await target.save();
    if (this.can.can('read model', target)) {
      await this.router.transitionTo('scopes.scope.targets.target', target);
    } else {
      await this.router.transitionTo('scopes.scope.targets');
    }
    this.refresh();
  }

  @action
  @loading
  @notifyError(({ message }) => message)
  async saveWithAddress(target) {
    const numHostSources = target.host_sources?.length;
    const address = target.address;
    if (address && numHostSources) {
      try {
        await this.confirm.confirm(
          this.intl.t(
            'resources.target.questions.delete-host-sources.message',
            { numHostSources }
          ),
          {
            title: 'resources.target.questions.delete-host-sources.title',
            confirm: 'actions.remove-resources',
          }
        );
      } catch (e) {
        // if the user denies, do nothing and return
        return;
      }

      await target.removeHostSources(
        target.host_sources.map((hs) => hs.host_source_id)
      );
      // After saving the host sources, the model gets reset to an empty address,
      // so we need to update the address with the previous value before saving
      target.address = address;
    }

    await this.save(target);
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
