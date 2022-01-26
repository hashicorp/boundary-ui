import GeneratedHostModel from '../generated/models/host';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class HostModel extends GeneratedHostModel {
  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentHostAttributesModel}
   */
  @fragment('fragment-host-attributes', { defaultValue: {} }) attributes;

  /**
   * Returns if the host is static type or not.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * Returns if the host is plugin or not.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * Returns if host plugin is AWS or not.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === 'aws';
  }

  /**
   * Returns if hist is Azure or not.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
  }

  /**
   * If host is a plugin return its name,
   * otherwise returns the host type
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
      this.plugin = { name: type };
    }
  }
}
