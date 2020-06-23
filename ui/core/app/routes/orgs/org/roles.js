import Route from '@ember/routing/route';

export default class OrgsOrgRolesRoute extends Route {
  // =methods

  /**
   * Returns all roles from store.
   * @return {Promise[RoleModel]}
   */
  model() {
    return this.store.findAll('role').catch(() => {
      // FIX ME: API response of "{}" generates following error:
      // Error while processing route: orgs.org.roles.index
      // Error: Assertion Failed: You made a 'findAll' request for 'role' records, but the adapter's response did not have any data
    });
  }

  /**
   * Renders the roles-specific sidebar template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    this.render('orgs/org/roles/_sidebar', {
      into: 'application',
      outlet: 'sidebar',
      model: model
    });
    super.renderTemplate(...arguments);
  }
}
