import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectRoute extends Route {
  // =methods

  /**
   * Loads a scope by ID (ostensibly a project scope).
   * @param {object} params
   * @param {string} params.project_id
   * @return {ScopeModel}
   */
  model({ project_id }) {
    return this.store.findRecord('scope', project_id);
  }

  /**
   * Renders the project-specific sidebar template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/_sidebar', {
      into: 'scopes/scope',
      outlet: 'sidebar',
      model: model,
    });
  }
}
