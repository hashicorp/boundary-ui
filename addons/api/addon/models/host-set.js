import GeneratedHostSetModel from '../generated/models/host-set';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class HostSetModel extends GeneratedHostSetModel {

  // =attributes

  /**
   * Grants is read-only _most_ under normal circumstances.  But grants can
   * be persisted via a dedicated call to `saveGrants()`.
   */
  @fragmentArray('fragment-string', {readOnly: true}) host_ids;

  // =methods

  /**
   * Saves the `host_ids` array on the host set via the `set-hosts` method.
   * See serializer and adapter for more information.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @param {string} options.adapterOptions.hostCatalogID
   * @return {Promise}
   */
  saveHostIDs(options={ adapterOptions: {} }) {
    const defaultOptions = {
      adapterOptions: {
        method: 'set-hosts',
        serializeHostIDs: true
      }
    };
    // There is no "deep merge" in ES.
    // All of this nonsense is here to ensure we get
    // a decent merge of `adapterOptions`.
    return this.save({
      ...defaultOptions,
      ...options,
      adapterOptions: {
        ...defaultOptions.adapterOptions,
        ...options.adapterOptions
      }
    });
  }

}
