import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsProjectTargetsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all targets under current project scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    return this.store.findAll('target', { adapterOptions: { scopeID } });
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
    if (isNew) this.transitionTo('scopes.scope.projects.project.targets');
  }

  /**
   * Handle save.
   * @param {TargetModel} target
   * @param {Event} e
   */
  @action
  async save(target) {
    const { isNew } = target;
    try {
      await target.save();
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notify.create-success' : 'notify.save-success')
      );
      this.transitionTo('scopes.scope.projects.project.targets.target', target);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Deletes a target and redirects to targets index.
   * @param {TargetModel} target
   */
  @action
  async delete(target) {
    try {
      await target.destroyRecord();
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
      this.transitionTo('scopes.scope.projects.project.targets');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
