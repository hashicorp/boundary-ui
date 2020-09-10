import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
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
  @computed('filteredHosts')
  get hasAvailableHosts() {
    return this.filteredHosts.length > 0;
  }

  /**
   * Hosts not currently assigned to current host set.
   * @type {[HostModel]}
   */
  @computed('args.{model,hosts}')
  get filteredHosts() {
    const currentHostIDs = this.args.model.host_ids.map(host => host.value);
    return this.args.hosts.filter(({ id }) => !currentHostIDs.includes(id));
  }

  // =actions

  @action
  toggleHost(host) {
    if (!this.selectedHostIDs.includes(host.id)) {
      this.selectedHostIDs.addObject(host.id);
    } else {
      this.selectedHostIDs.removeObject(host.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedHostIDs);
  }
}
