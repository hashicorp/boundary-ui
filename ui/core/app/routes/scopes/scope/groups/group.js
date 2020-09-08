import Route from '@ember/routing/route';

export default class ScopesScopeGroupsGroupRoute extends Route {

  // =methods

  /**
   * Load a group in current scope.
   * @param {object} params
   * @param {string} params.group_id
   * @return {groupModel}
   */
  model({ group_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('group', group_id, {
      reload: true,
      adapterOptions: { scopeID },
    });
  }

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/groups/group/-header', {
      into: 'scopes/scope/groups/group',
      outlet: 'header'
    });

    this.render('scopes/scope/groups/group/-actions', {
      into: 'scopes/scope/groups/group',
      outlet: 'actions'
    });

    this.render('scopes/scope/groups/group/-navigation', {
      into: 'scopes/scope/groups/group',
      outlet: 'navigation'
    });
  }
}
