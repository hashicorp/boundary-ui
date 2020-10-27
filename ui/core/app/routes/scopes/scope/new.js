import Route from '@ember/routing/route';

export default class ScopesScopeNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved scope belonging to the current scope.
   * @return {ScopeModel}
   */
  model() {
    const { id: scopeID, isOrg } = this.modelFor('scopes.scope');
    // NOTE: if the current scope is an org, we create a project, otherwise
    // it must be global and we create an org.  Boundary does not support
    // scopes under a project, so such a case is ignored.
    const type = isOrg ? 'project' : 'org';
    return this.store.createRecord('scope', { type, scopeID });
  }
}
