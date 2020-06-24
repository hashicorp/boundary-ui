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
  
}
