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

}
