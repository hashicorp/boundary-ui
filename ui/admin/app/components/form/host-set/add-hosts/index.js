/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { A } from '@ember/array';

export default class FormHostSetAddHostsIndexComponent extends Component {
  // =properties

  /**
   * Array of selected host IDs.
   * @type {EmberArray}
   */
  selectedHostIDs = A();

  /**
   * Checks for unassigned hosts.
   * @param {[HostModel]} filteredHosts
   * @type {boolean}
   */
  @computed('filteredHosts.length')
  get hasAvailableHosts() {
    return this.filteredHosts.length > 0;
  }

  /**
   * Hosts currently not assigned to current host set.
   * @type {[HostModel]}
   */
  @computed('args.{model,model.host_ids,hosts}')
  get filteredHosts() {
    return this.args.hosts.filter(
      ({ id }) => !this.args.model.host_ids.includes(id),
    );
  }

  // =actions

  /**
   * Toggle host selection
   * @param {string} hostId
   */
  @action
  toggleHost(hostId) {
    if (!this.selectedHostIDs.includes(hostId)) {
      this.selectedHostIDs.addObject(hostId);
    } else {
      this.selectedHostIDs.removeObject(hostId);
    }
  }

  /**
   * Callback submit with selected host ids
   * @param {requestCallback} fn
   */
  @action
  submit(fn) {
    fn(this.selectedHostIDs);
  }
}
