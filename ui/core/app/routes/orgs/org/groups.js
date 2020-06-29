import Route from '@ember/routing/route';

export default class OrgsOrgGroupsRoute extends Route {
  // =methods

  /**
   * Returns all groups from store.
   * @return {Promise[GroupModel]}
   */
  model() {
    return this.store.findAll('group');
  }
}
