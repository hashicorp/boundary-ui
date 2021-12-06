import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  /**
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }
}
