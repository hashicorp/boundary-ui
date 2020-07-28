import Route from '@ember/routing/route';

export default class ScopesScopeGroupsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved group.
   * @return {GroupModel}
   */
  model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.createRecord('group', { scopeID });
  }
}
