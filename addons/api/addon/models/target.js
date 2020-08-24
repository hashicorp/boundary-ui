import GeneratedTargetModel from '../generated/models/target';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class TargetModel extends GeneratedTargetModel {

  // =attributes

  @fragmentArray('fragment-host-set', {readOnly: true}) host_sets;

  // =methods

  /**
   * Saves the `host_set_ids` array on the via the `set-hosts` method.
   * See serializer and adapter for more information.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  saveHostSets(options={ adapterOptions: {} }) {
    const defaultOptions = {
      adapterOptions: {
        method: 'set-host-sets',
        serializeHostSets: true
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
