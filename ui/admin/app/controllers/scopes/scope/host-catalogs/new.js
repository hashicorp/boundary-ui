import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeHostCatalogsNewController extends Controller {
  // =attributes

  queryParams = ['type'];
  @tracked showDynamicPlugins = false;

  @action
  async toggleType(type) {
    this.renderDynamicPlugins(type);
  }

  renderDynamicPlugins(type) {
    if (type !== 'static') {
      this.showDynamicPlugins = true;
    } else {
      this.showDynamicPlugins = false;
    }
  }
}
