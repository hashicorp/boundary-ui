import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormHostCatalogIndexComponent extends Component {
  // =properties
  /**
  /**
   */
   @tracked showDynamicPlugins = false;
  // =actions

  @action
  toggleType(type) {
    this.renderDynamicPlugins(type);
  }
  renderDynamicPlugins(type) {
   if(type === 'dynamic') {
      this.showDynamicPlugins = true;
   } else {
    this.showDynamicPlugins = false;
   }
 }

}
