import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  /**
   * Returns if the host-catalog is static type or not.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

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
    return this.compositeType === 'aws';
  }

  /**
   * Return if host-catalog plugin is Azure or not.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
  }

  /** If host-catalog is a plugins returns its name,
   * otherwise returns the host-catalog type
   * @type {string}
   */
  get compositeType() {
    return this.isPlugin ? this.plugin.name : this.type;
  }

  /**
   * Sets type, if type is different than static, sets plugin name to type
   */
  set compositeType(type) {
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
      this.plugin = { name: type }
    }
  }
}
