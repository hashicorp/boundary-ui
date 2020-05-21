import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrgsOrgRoute extends Route {
  // =services

  @service scope;

  // =methods

  /**
   * Returns a mock organization object containing the specified ID.
   * TODO:  load a real org instance from the API.
   * @param {object} params
   * @return {object}
   */
  model({ org_id: id }) {
    return { id };
  }

  /**
   * Adds the org to the scope.
   * @param {object} org
   */
  afterModel(org) {
    this.scope.org = org;
    return super.afterModel(...arguments);
  }
}
