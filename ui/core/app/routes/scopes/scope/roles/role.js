import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleRoute extends Route {
  // =methods

  /**
   * Load a role in current scope.
   * @param {object} params
   * @param {string} params.role_id
   * @return {RoleModel}
   */
  model({ role_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('role', role_id, {
      adapterOptions: { scopeID },
    });
  }

  /**
   * Renders the role specific templates for header, navigation,
   * and actions page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/roles/role/-header', {
      into: 'scopes/scope/roles/role',
      outlet: 'header',
    });

    this.render('scopes/scope/roles/role/-navigation', {
      into: 'scopes/scope/roles/role',
      outlet: 'navigation',
    });

    this.render('scopes/scope/roles/role/-actions', {
      into: 'scopes/scope/roles/role',
      outlet: 'actions',
    });
  }
}
