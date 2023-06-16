import Controller from '@ember/controller';

export default class ScopesScopeStorageBucketsStorageBucketController extends Controller {
  // =attributes

  /**
   * A storage-bucket breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
