import Route from '@ember/routing/route';

export default class OrgsLoginRoute extends Route {

  // =methods

  /**
   * Redirects to the org authentication route for the first org.
   * @param {[OrgModel]} orgs
   */
  redirect(orgs) {
    if (orgs.firstObject) {
      this.transitionTo('orgs.org.login', orgs.firstObject);
    }
  }

}
