import Route from '@ember/routing/route';

export default class ScopesScopeOrgsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved org scope belonging to the global scope.
   * @return {ScopeModel}
   */
  model() {
    return this.store.createRecord('scope', {
      type: 'org',
      scopeID: 'global',
    });
  }
}
