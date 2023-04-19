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
   * @return {{sessionRecordings: Array, storageBuckets: Array}}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    // if (this.can.can('list session-recording', scope, { collection: 'session-recordings' })) {
    const { id: scope_id } = scope;

    const sessionRecordings = await this.store.query('session-recording', {
      scope_id,
      recursive: true,
    });
    const storageBuckets = await this.store.query('storage-bucket', {
      scope_id,
      recursive: true,
    });
    return {
      sessionRecordings,
      storageBuckets,
    };
    // }
  }

  // =actions
}
