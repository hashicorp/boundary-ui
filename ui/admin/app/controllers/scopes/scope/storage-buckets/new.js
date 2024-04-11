import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeStorageBucketsNewController extends Controller {
  @controller('scopes/scope/storage-buckets/index')
  storageBuckets;

  // =services
  @service router;

  // =attributes
  queryParams = ['compositeType'];

  // =actions
  /**
   * Changes the plugin type.
   * @param {*} pluginType
   */
  @action
  async changePluginType(pluginType) {
    await this.router.replaceWith({
      queryParams: { compositeType: pluginType },
    });
  }
}
