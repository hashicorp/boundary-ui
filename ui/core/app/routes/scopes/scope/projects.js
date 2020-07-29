import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Loads all scopes under the current scope.
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('scope', { scope_id });
  }

  /**
   * If arriving here within a verifiable project scope, redirect to its
   * parent, which is necessarily an org, in order to list projects.
   *
   * TODO:  this conditional redirect based on the scope type is probably
   *        necessary for many routes directly under scope, so we may want
   *        to move this into a mixin.
   * @param {ScopeModel}
   */
  redirect() {
    const { isProject, scopeID } = this.modelFor('scopes.scope');
    if (isProject) this.transitionTo('scopes.scope.projects', scopeID);
  }

  // =actions

  /**
   * Rollback changes on project.
   * @param {ProjectModel} project
   */
  @action
  cancel(project) {
    const { isNew } = project;
    project.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.projects');
  }

  /**
   * Handle save project.
   * @param {ProjectModel} project
   * @param {Event} e
   */
  @action
  async save(project) {
    const { isNew } = project;
    try {
      await project.save();
      this.refresh();
      this.notify.success(this.intl.t(
        isNew ? 'notify.create-success' : 'notify.save-success'
      ));
      this.transitionTo('scopes.scope.projects.project', project);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Deletes the project and redirects to index.
   * @param {ProjectModel} project
   */
  @action
  async delete(project) {
    try {
      await project.destroyRecord();
      this.refresh();
      this.notify.success('notify.delete-success');
      this.transitionTo('scopes.scope.projects');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
