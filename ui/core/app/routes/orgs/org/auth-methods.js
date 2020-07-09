import Route from '@ember/routing/route';

export default class OrgsOrgAuthMethodsRoute extends Route {
  // =methods

  /**
   * Returns all auth methods from the store.
   * @return {Promise[AuthMethodModel]}
   */
  model() {
    return this.store.findAll('auth-method');
  }

  // for integration testing
  // model() {
  //   return [{
  //     displayName: 'foobar',
  //     type: 'password'
  //   }]
  // }
}
