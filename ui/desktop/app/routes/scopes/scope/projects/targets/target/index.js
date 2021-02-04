import Route from '@ember/routing/route';

export default class ScopesScopeProjectsTargetsTargetIndexRoute extends Route {
  // =methods

  /**
   * Navigate to hosts within a target.
   */
  afterModel() {
    this.transitionTo('scopes.scope.projects.targets.target.sessions');
  }

}
