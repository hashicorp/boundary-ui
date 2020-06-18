import Route from '@ember/routing/route';

export default class OrgsRoute extends Route {

  // =methods

  /**
   * Returns all orgs from the store.
   * @return {Promise[OrgModel]}
   */
  model() {
    return this.store.findAll('org');
  }

}
