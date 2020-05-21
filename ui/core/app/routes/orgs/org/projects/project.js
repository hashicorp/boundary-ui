import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgProjectsProjectRoute extends Route {
  // =services

  @service scope;

  // =methods

  /**
   * Returns a project by id.
   * @param {object} params
   * @return {Promise{ProjectModel}}
   */
  model({ project_id: id }) {
    return this.store.findRecord('project', id);
  }

  /**
   * Adds the project to the scope.
   * @param {ProjectModel} project
   */
  afterModel(project) {
    this.scope.project = project;
    return super.afterModel(...arguments);
  }

  // =actions

  /**
   * Rollback changes on project.
   * @param {ProjectModel} project
   */
  @action
  cancel(project) {
    project.rollbackAttributes();
  }

  /**
   * Handle save project.
   * @param {ProjectModel} project
   * @param {Event} e
   */
  @action
  async save(project, e) {
    // Prevent default behavior, since this was trigger from a form submission.
    e.preventDefault();
    try {
      await project.save();
    } catch (e) {
      // TODO: error handling
      throw e;
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
      this.transitionTo('orgs.org.projects');
    } catch (e) {
      // TODO: error handling
      throw e;
    }
  }
}
