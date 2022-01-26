import GeneratedHostModel from '../generated/models/host';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class HostModel extends GeneratedHostModel {
  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentHostAttributesModel}
   */
  @fragment('fragment-host-attributes', { defaultValue: {} }) attributes;

  /**
   * True if the host is static.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * True if the host is plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * True if the host plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === 'aws';
  }

  /**
   * True if the host plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
  }

  /**
   * If host is a plugin return `plugin.name`,
   * otherwise return the host type.
   * @type {string}
   */
  get compositeType() {
    return this.isPlugin ? this.plugin.name : this.type;
  }

  /**
   * Sets `type`. If type is different than `static`, sets `type` to `plugin`
   * and `plugin.name` to the specified type.
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
