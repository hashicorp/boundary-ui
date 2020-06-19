import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrgsOrgRoute extends Route {
  // =services

  @service scope;

  // =methods

  /**
   * Returns an org by id.
   * @param {object} params
   * @return {Promise{OrgModel}}
   */
  model({ org_id: id }) {
    return this.store.findRecord('org', id);
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
