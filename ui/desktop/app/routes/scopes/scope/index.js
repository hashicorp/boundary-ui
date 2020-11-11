import Route from "@ember/routing/route";

export default class ScopesScopeIndexRoute extends Route {
  // =methods

  /**
   * Redirects to scopes route for further processing.
   */
  redirect() {
    this.transitionTo("scopes.scope.targets");
  }
}
