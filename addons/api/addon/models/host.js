import GeneratedHostModel from '../generated/models/host';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';

export default class HostModel extends GeneratedHostModel {

  // =attributes

  /**
   * Host set IDs to which this host belongs.
   * @type {[FragmentStringModel]}
   */
  @fragmentArray('fragment-string', {readOnly: true}) host_set_ids;

  /**
   * An array of host sets associated with this host.  Since host sets are
   * returned on a best-effort basis via `peekRecord`, they must already be
   * in the store.  This is an intentional alternative to Ember Data's own
   * relationship management.
   * @type {[HostSetModel]}
   */
  @computed('host_set_ids.@each.value')
  get hostSets() {
    return this.host_set_ids
      .map(({ value: id }) => this.store.peekRecord('host-set', id));
  }

}
