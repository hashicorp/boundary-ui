import Route from '@ember/routing/route';

export default class ScopesScopeGroupsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved group.
   * @return {GroupModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('group', { type: 'group', scopeModel });
  }
}
