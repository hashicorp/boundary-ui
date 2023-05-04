/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
      ({ id }) => !this.args.model.host_ids.includes(id)
    );
  }

  // =actions

  /**
   * Toggle host selection
   * @param {HostModel} host
   */
  @action
  toggleHost(host) {
    if (!this.selectedHostIDs.includes(host.id)) {
      this.selectedHostIDs.addObject(host.id);
    } else {
      this.selectedHostIDs.removeObject(host.id);
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
