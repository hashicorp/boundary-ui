import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgProjectsNewRoute extends Route {
  // =services

  @service notify;
  
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
  async save(project) {
    try {
      await project.save();
      this.transitionTo('orgs.org.projects.project', project);
      // TODO: replace with translated strings
      this.notify.success('Project created.');
    } catch (e) {
      // TODO: replace with translated strings
      this.notify.error('Project could not be created.');
    }
  }
}
