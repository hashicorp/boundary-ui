import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddHostSetsComponent extends Component {
  // =properties

  /**
   * Array of selected host set IDs.
   * @type {EmberArray}
   */
  selectedHostSetIDs = A();

  /**
   * Checks for unassigned hostsets.
   * @param {[HostSetModel]} filteredHostSets
   * @type {boolean}
   */
  @computed('filteredHostSets.length')
  get hasAvailableHostSets() {
    return this.filteredHostSets.length > 0;
  }

  /**
   * Host sets not already added to the target.
   * @type {[HostSetModel]}
   */
  @computed('args.{hostSets.[],model.host_sets.[]}')
  get filteredHostSets() {
    // Get IDs for host sets already added to the current target
    const alreadyAddedHostSetIDs = this.args.model.host_sets.map(
      ({ host_source_id }) => host_source_id
    );
    const notAddedHostSets = this.args.hostSets.filter(
      ({ id }) => !alreadyAddedHostSetIDs.includes(id)
    );
    return notAddedHostSets;
  }

  // =actions

  @action
  toggleHostSet(hostSet) {
    if (!this.selectedHostSetIDs.includes(hostSet.id)) {
      this.selectedHostSetIDs.addObject(hostSet.id);
    } else {
      this.selectedHostSetIDs.removeObject(hostSet.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedHostSetIDs);
  }
}
