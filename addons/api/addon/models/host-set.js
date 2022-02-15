import GeneratedHostSetModel from '../generated/models/host-set';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { types } from './host-catalog';

export default class HostSetModel extends GeneratedHostSetModel {
  // =attributes

  /**
   * Returns if the host-set is static or not.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * Returns if the host-set is plugin or not.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * True if the host set is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return this.isPlugin && !types.includes(this.plugin?.name);
  }

  /**
   * Returns if a host-set plugin is AWS or not
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === 'aws';
  }

  /**
   * Return if a host-set plugin is Azure or not.
   */
  get isAzure() {
    return this.compositeType === 'azure';
  }

  /**
   * If a host-set is a plugin return its name,
   * otherwise returns the host-set type
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return 'static';
  }

  /**
   * Sets type, if type is different than static, set plugin name to type
   */
  set compositeType(type) {
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
      this.plugin = { name: type };
    }
  }

  /**
   * Host IDs are read-only under normal circumstances.  But these can
   * be persisted via a dedicated call to `addHosts()`.
   */
  @fragmentArray('fragment-string', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_ids;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
  })
  preferred_endpoints;

  // AWS specific
  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  filters;

  // =methods

  /**
   * Adds hosts via the `add-hosts` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addHosts(hostIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-hosts',
      hostIDs,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Add a single host via the `add-hosts` method.
   * @param {string} hostID
   * @param {object} options
   * @return {Promise}
   */
  addHost(hostID, options) {
    return this.addHosts([hostID], options);
  }

  /**
   * Delete hosts via the `remove-hosts` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeHosts(hostIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-hosts',
      hostIDs,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete a single host via the `remove-hosts` method.
   * @param {string} hostID
   * @param {object} options
   * @return {Promise}
   */
  removeHost(hostID, options) {
    return this.removeHosts([hostID], options);
  }
}
