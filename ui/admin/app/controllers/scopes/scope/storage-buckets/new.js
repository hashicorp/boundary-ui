import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeStorageBucketsNewController extends Controller {
  // =services
  @service router;

  // =attributes
  queryParams = ['compositeType'];

  // =actions
  @action
  async changePluginType(pluginType) {
    await this.router.replaceWith({
      queryParams: { compositeType: pluginType },
    });
  }
}
