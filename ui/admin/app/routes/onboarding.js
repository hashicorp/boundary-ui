import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OnboardingRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * List all scopes (orgs) under global.
   */
  model() {
    return this.store.query('scope', {
      scope_id: 'global',
    });
  }

  /**
   * If any orgs already exist, redirect to index to skip onboarding.
   */
  redirect(model) {
    // If there are orgs already created, redirect to index.
    if (model.length) this.router.transitionTo('index');
  }
}
