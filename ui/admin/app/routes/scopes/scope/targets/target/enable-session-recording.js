import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetEnableSessionRecordingRoute extends Route {
  // =services

  @service router;

  // =methods

  /**
   * Returns the current target and all storage buckets.
   * @return {{target: TargetModel, storageBuckets: [StorageBucketModel]}}
   */

  async model() {
    // TODO: need model for storage_bucket as well
    return this.modelFor('scopes.scope.targets.target');
  }
}
