import GeneratedTargetModel from '../generated/models/target';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';

export default class TargetModel extends GeneratedTargetModel {

  // =attributes

  /**
   * @type {[FragmentHostSetModel]}
   */
  @fragmentArray('fragment-host-set', {readOnly: true}) host_sets;

  /**
   * An array of resolved host set and host catalog instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[{model: HostSetModel, hostCatalog: HostCatalogModel}]}
   */
  @computed('host_sets.[]')
  get hostSets() {
    return this.host_sets
      .map(({ host_set_id, host_catalog_id }) => ({
        model: this.store.peekRecord('host-set', host_set_id),
        hostCatalog: this.store.peekRecord('host-catalog', host_catalog_id)
      }))
      .filter(hostSetRef => hostSetRef.model !== null);
  }

  // =methods

  /**
   * Adds host sets via the `add-host-sets` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addHostSets(hostSetIDs, options={ adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-host-sets',
      hostSetIDs
    };
    // There is no "deep merge" in ES.
    // All of this nonsense is here to ensure we get
    // a decent merge of `adapterOptions`.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions
      }
    });
  }

  /**
   * Delete host sets via the `remove-host-sets` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeHostSets(hostSetIDs, options={ adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-host-sets',
      hostSetIDs
    };
    // There is no "deep merge" in ES.
    // All of this nonsense is here to ensure we get
    // a decent merge of `adapterOptions`.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions
      }
    });
  }

  /**
   * Delete a single host set via the `remove-host-sets` method.
   * @param {number} hostSetID
   * @param {object} options
   * @return {Promise}
   */
  removeHostSet(hostSetID, options) {
    return this.removeHostSets([hostSetID], options);
  }

}
