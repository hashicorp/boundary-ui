import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class OrgsOrgProjectsNewRoute extends Route {
  // =methods

  /**
   * Returns a new unsaved project.
   * @return {Promise{ProjectModel}}
   */
  model() {
    return this.store.createRecord('project');
  }

  // =actions

  /**
   * Rollback changes on project (which destroys unsaved instances)
   * and redirects to projects index.
   * @param {ProjectModel} project
   */
  @action
  cancel(project) {
    project.rollbackAttributes();
    this.transitionTo('orgs.org.projects');
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
      this.transitionTo('orgs.org.projects.project', project);
    } catch (e) {
      // TODO: error handling
      throw e;
    }
  }
}
