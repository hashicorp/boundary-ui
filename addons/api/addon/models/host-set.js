import GeneratedHostSetModel from '../generated/models/host-set';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class HostSetModel extends GeneratedHostSetModel {

  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  // =attributes

  /**
   * Grants is read-only _most_ under normal circumstances.  But grants can
   * be persisted via a dedicated call to `saveGrants()`.
   */
  @fragmentArray('fragment-string', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_ids;

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
