import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeTargetsTargetEnableSessionRecordingRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Returns the current target and all storage buckets.
   * @return {{target: TargetModel, storageBuckets: [StorageBucketModel]}}
   */

  async model() {
    const target = this.modelFor('scopes.scope.targets.target');
    const { scopeID: scope_id } = this.modelFor('scopes.scope');

    //fetch storage buckets from global scope
    const globalScopeStorageBuckets = await this.store.query('storage-bucket', {
      scope_id: 'global',
    });

    //fetch storage buckets from target's org scope
    const orgScopeStorageBuckets = await this.store.query('storage-bucket', {
      scope_id,
    });

    //merge results from both global and target's org scope
    //into one list for the dropdown
    const storageBucketList = [
      ...globalScopeStorageBuckets.toArray(),
      ...orgScopeStorageBuckets.toArray(),
    ];

    return {
      target,
      storageBucketList,
    };
  }

  // =actions

  /**
   * Reset the selected storage bucket and redirect to target
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { id } = target;
    target.rollbackAttributes();
    this.router.replaceWith('scopes.scope.targets.target', id);
  }
}
