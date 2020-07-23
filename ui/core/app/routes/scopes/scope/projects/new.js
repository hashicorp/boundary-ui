import Route from '@ember/routing/route';

export default class ScopesScopeProjectsNewRoute extends Route {

  // =methods

  /**
   * Creates a new unsaved project scope belonging to the current org scope.
   * @return {ScopeModel}
   */
  model() {
    const { id } = this.modelFor('scopes.scope');
    return this.store.createRecord('scope', {
      type: 'project',
      scopeID: id
    });
  }

}
