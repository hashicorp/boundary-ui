import Route from '@ember/routing/route';

export default class ScopesScopeWorkersWorkerRoute extends Route {
  // =methods

  /**
   * Load a worker in current scope.
   * @param {object} params
   * @param {string} params.worker_id
   * @return {WorkerModel}
   */
  model({ worker_id }) {
    return this.store.findRecord('worker', worker_id);
  }
}
