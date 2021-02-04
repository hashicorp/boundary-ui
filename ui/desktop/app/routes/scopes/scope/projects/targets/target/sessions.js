import Route from '@ember/routing/route';

export default class ScopesScopeProjectsTargetsTargetSessionsRoute extends Route {
  // =methods

  /**
   * Loads all sessions for current target.
   * @return {Promise{[SessionModel]}}
   */
  async model() {
    return this.modelFor('scopes.scope.projects.targets.target').sessions;
  }
}
