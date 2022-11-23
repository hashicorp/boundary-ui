import Component from '@glimmer/component';
import { options } from 'api/models/host-catalog';

export default class FormHostCatalogIndexComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  hostCatalogTypes = options.types.host_catalog;
  pluginTypes = options.types.plugin;
}
