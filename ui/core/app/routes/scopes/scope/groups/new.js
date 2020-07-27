import Route from '@ember/routing/route';

export default class ScopesScopeGroupsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved group.
   * @return {GroupModel}
   */
  model() {
    return this.store.createRecord('group');
  }
}
