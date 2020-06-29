import Route from '@ember/routing/route';

export default class OrgsOrgUsersRoute extends Route {
  // =methods

  /**
   * Returns all users from the store.
   * @return {Promise[UserModel]}
   */
  model() {
    return this.store.findAll('user');
  }
}
