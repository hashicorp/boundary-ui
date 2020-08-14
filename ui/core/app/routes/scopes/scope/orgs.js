import Route from '@ember/routing/route';

export default class ScopesScopeOrgsRoute extends Route {

  // =methods

  /**
   * Loads all scopes under the global scope.
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    return this.store.query('scope', { scope_id: 'global' });
  }

}
