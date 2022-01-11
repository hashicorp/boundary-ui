import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  /**
   * Returns if the host-catalog is a plugin or not.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * Returns if host-catalog plugin is AWS or not
   * @type {boolean}
   */
  get isAWS() {
    return this.plugin.name === 'aws';
  }

  /**
   * Return if host-catalog plugin is Azure or not.
   * @type {boolean}
   */
  get isAzure() {
    return this.plugin.name === 'azure';
  }
}
