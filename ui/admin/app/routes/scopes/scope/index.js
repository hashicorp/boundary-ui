import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeIndexRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * Redirects to scopes/scope/authenticate for further processing.
   * If already authenticated, redirects to scopes/scope/scopes to display
   * list of sub scopes.
   *
   * If authenticated but no orgs exist, redirect into onboarding.
   */
  redirect(model) {
    const hasOrgs = this.store.peekAll('scope').filterBy('type', 'org').length;

    // Must authenticate before proceeding anywhere else
    if (!this.session.isAuthenticated) {
      return this.router.transitionTo('scopes.scope.authenticate');
    }

    // If authenticated but no orgs exist yet, redirect to onboarding
    if (this.session.isAuthenticated && !hasOrgs) {
      return this.router.transitionTo('onboarding.quick-setup.choose-path');
    }

    // If this a project scope, there are no further sub scopes, so show edit
    if (model.isProject) {
      return this.router.transitionTo('scopes.scope.edit');
    }

    // For all other scope types (global and org), show sub scopes
    return this.router.transitionTo('scopes.scope.scopes');
  }
}
