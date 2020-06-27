import Route from '@ember/routing/route';

export default class OrgsIndexRoute extends Route {

  // =methods

  /**
   * Redirect to the orgs.authenticate route, which handles additional
   * redirecting if the user is already authenticated.
   */
  redirect() {
    this.transitionTo('orgs.authenticate');
  }

}
