import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError, notifySuccess } from 'core/decorators/notify';

export default class ScopesScopeWorkersNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved worker.
   * @return {WorkerModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('worker', { scopeModel });
  }

  /**
   * Created the worker and notifies the user of success or error.
   * @param {WorkerModel} worker
   * @param {string} workerGeneratedAuthToken
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async createWorkerLed(worker, workerGeneratedAuthToken) {
    await worker.createWorkerLed(workerGeneratedAuthToken);
  }
}
