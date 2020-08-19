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
   * @return {Promise}
   */
  saveHostIDs() {
    return this.save({
      adapterOptions: {
        method: 'set-hosts',
        serializeHostIDs: true
      }
    });
  }

}
