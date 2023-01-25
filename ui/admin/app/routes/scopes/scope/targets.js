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
   * Saves the target and refreshes the list.
   * @param {TargetModel} target
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

  /**
   * Targets may have either an `address` _or_ host sources, but not both.
   *
   * In order to save a target with an `address`, any existing host sources
   * must first be removed.  Once host sources are removed, the target with
   * `address` may be saved via the standard `save` action.
   *
   * If `address` and host sources are both present, the user is asked to
   * confirm that they wish to remove all host sources.  If the user declines,
   * no changes are persisted; the form remains editable and unsaved.
   *
   * If `address` is set and the target has no host sources, the save proceeds
   * as normal.
   *
   * If neither `address` nor host sources are set, the save proceeds as normal.
   *
   * @param {TargetModel} target
   */
  @action
  async saveWithAddress(target) {
    if (target.address) {
      const { address } = target;
      // Remove host sources if necessary.  This is cancelable by the user.
      await this.removeHostSources(target);
      // After removing host sources, the model is reset to an empty address,
      // so we need to update the address with the previous value.
      target.address = address;
    }

    // Proceed with standard save.
    await this.save(target);
  }

  /**
   * If the passed target has host sources:
   *   - Request confirmation from the user for host source removal.
   *   - Persist removal of all host sources.
   * @param {TargetModel} target
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  async removeHostSources(target) {
    const hostSourceCount = target.host_sources?.length;

    if (hostSourceCount) {
      const ids = target.host_sources.map(({ host_source_id: id }) => id);
      const confirmMessage = this.intl.t(
        'resources.target.questions.delete-host-sources.message',
        { hostSourceCount }
      );

      // Ask for confirmation
      await this.confirm.confirm(confirmMessage, {
        title: 'resources.target.questions.delete-host-sources.title',
        confirm: 'actions.remove-resources',
      });
      // Remove host sources.  This step is reached only if the user accepts.
      await target.removeHostSources(ids);
    }
  }

  /**
   * Deletes a target and redirects to targets index.
   * @param {TargetModel} target
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.delete-success')
  async delete(target) {
    await target.destroyRecord();
    await this.router.replaceWith('scopes.scope.targets');
    this.refresh();
  }
}
