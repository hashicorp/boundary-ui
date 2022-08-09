import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeWorkersRoute extends Route {
  // =services

  @service can;
  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all workers.
   * @return {WorkerModel}
   */
  model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (this.can.can('list worker', scope, { collection: 'workers' })) {
      return this.store.query('worker', { scope_id });
    }
  }

  /**
   * Refreshes worker data.
   */
  @action
  refreshWorkers() {
    return super.refresh(...arguments);
  }
}
