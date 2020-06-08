import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgProjectsProjectRoute extends Route {
  // =services

  @service scope;
  @service notify;

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

  /**
   * Renders the project-specific sidebar template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    this.render('orgs/org/projects/project/_sidebar', {
      into: 'application',
      outlet: 'sidebar',
      model: model
    });
    super.renderTemplate(...arguments);
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
  async save(project) {
    try {
      await project.save();
      // TODO: replace with translated strings
      this.notify.success('Save succeeded.');
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
      this.transitionTo('orgs.org.projects');
      // TODO: replace with translated strings
      this.notify.success('Deleted project succesfully.');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
