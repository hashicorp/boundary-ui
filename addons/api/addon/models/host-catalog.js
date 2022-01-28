import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export const types = ['aws', 'azure'];

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  // =attributes

  /**
   * True if the host catalog is static.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * True if the host catalog is a plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * True if the host catalog is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    console.log(this.isPlugin, 'IS IT PLUGIN', this.plugin, types);
    // if(this.plugin === undefined) {
    //   console.log('in USEFNNFNF')
    //   return false;
    // } else {
    //   console.log('in ELSE EE')

      return this.isPlugin && !types.includes(this.plugin.name);
    // }
  }

  /**
   * True if host catalog plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === 'aws';
  }

  /**
   * True if host catalog plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
  }

  /**
   * If host catalog is a plugin return `plugin.name`,
   * otherwise return the host catalog type.
   * @type {string}
   */
  get compositeType() {
    console.log(this, this.isPlugin, 'WHAT IS PLUGNI');
   // if(this.plugin === undefined) return 'static';
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return 'static';
  }

  /**
   * Sets `type`.  If type is different than `static`, sets `type` to `plugin`
   * and `plugin.name` to the specified type.
   */
  set compositeType(type) {
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
     
      this.plugin = { name: type };
      console.log('COMPOSITI' ,  this.plugin, type)
    }
  }
}
