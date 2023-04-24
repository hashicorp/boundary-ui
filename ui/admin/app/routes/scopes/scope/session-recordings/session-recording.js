import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingRoute extends Route {
  // =services
  @service store;
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
   * Load session recording, sorted connections and channels,
   * and related storage bucket if present
   * @return {{sessionRecording: SessionRecordingModel, sortedConnections: [ConnectionRecordingModel], storageBucket: ?StorageBucketModel}}
   */
  async model({ session_recording_id }) {
    let storageBucket = null;
    const sessionRecording = await this.store.findRecord(
      'session-recording',
      session_recording_id
    );

    try {
      if (sessionRecording.target?.storage_bucket_id) {
        const { storage_bucket_id } = sessionRecording.target;
        storageBucket = await this.store.findRecord(
          'storage-bucket',
          storage_bucket_id
        );
      }
    } catch (e) {
      // no op
    }

    return {
      sessionRecording,
      storageBucket,
    };
  }
}
