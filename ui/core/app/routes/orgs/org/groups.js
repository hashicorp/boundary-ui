import Route from '@ember/routing/route';

export default class OrgsOrgGroupsRoute extends Route {
  // =methods

  /**
   * Returns all roles from store.
   * @return {Promise[RoleModel]}
   */
  model() {
    return this.store.findAll('group');
  }
}
