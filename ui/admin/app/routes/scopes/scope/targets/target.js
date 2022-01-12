import Route from '@ember/routing/route';

export default class ScopesScopeTargetsTargetRoute extends Route {
  // =methods

  /**
   * Load a target.
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  async model({ target_id }) {
    return this.store.findRecord('target', target_id, { reload: true });
  }
}
