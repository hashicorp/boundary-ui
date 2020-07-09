import Route from '@ember/routing/route';

export default class OrgsOrgIndexRoute extends Route {
  // =methods

  /**
   * Redirects to the projects index for this org.
   */
  redirect() {
    this.transitionTo('orgs.org.projects');
  }
}
