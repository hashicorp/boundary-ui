import Route from '@ember/routing/route';

export default class OrgsOrgAuthenticateIndexRoute extends Route {
  // =methods

  /**
   * Redirects to the auth method route using the first auth method instance.
   * @param {[AuthMethodModel]} authMethods
   */
  redirect({ authMethods }) {
    if (authMethods.firstObject) {
      this.transitionTo(
        'orgs.org.authenticate.method',
        authMethods.firstObject
      );
    }
  }
}
