import GeneratedHostSetModel from '../generated/models/host-set';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
//import { computed } from '@ember/object';

export default class HostSetModel extends GeneratedHostSetModel {

  // =attributes

  /**
   * Grants is read-only _most_ under normal circumstances.  But grants can
   * be persisted via a dedicated call to `saveGrants()`.
   */
  @fragmentArray('fragment-string', {readOnly: true}) host_ids;

  // TODO this is here in case we want it in the future,
  // especially for the target / add host sets workflow
  /**
   * Returns the host catalog instance associated with this host set if
   * it is already loaded into the store.
   * @type {?HostCatalogModel}
   */
  // @computed('host_catalog_id')
  // get hostCatalog() {
  //   return this.store.peekRecord('host-catalog', this.host_catalog_id);
  // }

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
