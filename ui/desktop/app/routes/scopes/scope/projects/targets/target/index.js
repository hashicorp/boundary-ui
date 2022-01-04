import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsTargetsTargetIndexRoute extends Route {
  // =services

  @service router;

  // =methods

  /**
   * Navigate to hosts within a target.
   */
  afterModel() {
    this.router.transitionTo('scopes.scope.projects.targets.target.sessions');
  }
}
