import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsTargetsTargetRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a target
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  model({ target_id }) {
    return this.store.findRecord('target', target_id, { reload: true });
  }
}
