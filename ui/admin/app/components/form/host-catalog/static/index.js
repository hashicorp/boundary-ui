import Component from '@glimmer/component';
import { types, pluginTypes } from 'api/models/host-catalog';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['aws-color', 'azure-color'];

export default class FormStaticHostCatalogAwsComponent extends Component {
  // =properties
  hostCatalogTypes = types;
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypewithIcon() {
    return pluginTypes.reduce(
      (obj, plugin, i) => ({ ...obj, [plugin]: icons[i] }),
      {}
    );
  }
}
