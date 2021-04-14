import Route from '@ember/routing/route';

export default class AuthenticationErrorRoute extends Route {
  // =methods

  /**
   * @return {string}
   */
  model() {
    return window.location.toString();
  }
}
