import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  // =methods

  /**
   * Redirects to scopes route for further processing.
   */
  redirect() {
    this.replaceWith('scopes');
  }
}
