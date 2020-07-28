import Route from '@ember/routing/route';

export default class ScopesScopeGroupsGroupRoute extends Route {
  // =methods

  /**
   * Load a group in current scope.
   * @param {object} params
   * @param {string} params.group_id
   * @return {groupModel}
   */
  async model({ group_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('group', group_id, { adapterOptions: { scopeID } });
  }
}
