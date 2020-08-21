import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectTargetsTargetRoute extends Route {

  // =methods

  /**
   * Load a target.
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  async model({ target_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope.projects.project');
    return this.store.findRecord('target', target_id, { adapterOptions: { scopeID } });
  }

}
