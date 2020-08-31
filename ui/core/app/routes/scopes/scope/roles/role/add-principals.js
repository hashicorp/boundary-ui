import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleAddPrincipalsRoute extends Route {

  // =methods

  /**
   * Empties the actions and navigation outlets and renders a custom header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/roles/role/add-principals/-header', {
      into: 'scopes/scope/roles/role',
      outlet: 'header'
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'actions'
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'navigation'
    });
  }
}
