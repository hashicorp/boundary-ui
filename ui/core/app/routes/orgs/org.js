import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrgsOrgRoute extends Route {
  // =services

  @service scope;

  // =methods

  /**
   * Sets the scope to the specified organization and returns the org.
   * @param {object} params
   * @return {object}
   */
  model({ org_id: id }) {
    this.scope.org = { id };
    return this.scope.org;
  }
}
