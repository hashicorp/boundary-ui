import Route from '@ember/routing/route';

export default class OrgsAuthenticateRoute extends Route {

  // =methods

  /**
   * Redirects to the org authentication route for the first org.
   * @param {[OrgModel]} orgs
   */
  redirect(orgs) {
    if (orgs.firstObject) {
      this.transitionTo('orgs.org.authenticate', orgs.firstObject);
    }
  }

}
