import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  // =methods

  /**
   * If arriving at index, redirect to authenticate for further processing.
   */
  redirect() {
    this.transitionTo('orgs.authenticate');
  }
}
