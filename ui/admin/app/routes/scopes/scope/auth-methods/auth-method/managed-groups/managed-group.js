import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load managed group by ID.
   * @param {object} params
   * @param {string} params.managed_group_id
   * @returns {ManagedGroupModel}
   */
  model({ managed_group_id }) {
    return this.store.findRecord('managed-group', managed_group_id, {
      reload: true,
    });
  }
}
