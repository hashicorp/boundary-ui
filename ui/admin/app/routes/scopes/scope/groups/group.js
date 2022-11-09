import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsGroupRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a group in current scope.
   * @param {object} params
   * @param {string} params.group_id
   * @return {groupModel}
   */
  model({ group_id }) {
    return this.store.findRecord('group', group_id, { reload: true });
  }
}
