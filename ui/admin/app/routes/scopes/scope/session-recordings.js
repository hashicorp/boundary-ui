import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsRoute extends Route {
  // =services

  @service store;
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
   * Load all session recordings.
   * @return {SessionRecordingModel}
   */
  model() {
    // TODO: awaiting modeled data
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    // if (this.can.can('list session-recording', scope, { collection: 'session-recordings' })) {
    return this.store.query('recording', { scope_id });
    // }
  }

  // =actions
}
