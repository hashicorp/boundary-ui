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
   * Groups host sets not already added to the target by host catalog.
   * @type {[{hostCatalog: HostCatalogModel, hostSets: [{HostSetModel}]}]}
   */
  @computed('args.{hostCatalogs.[],hostSets.[],model.host_sets.[]}')
  get hostSetGroups() {
    // Get IDs for host sets already added to the current target
    const alreadyAddedHostSetIDs = this.args.model.host_sets
      .map(({ host_set_id }) => host_set_id);
    const notAddedHostSets = this.args.hostSets
      .filter(({ id }) => !alreadyAddedHostSetIDs.includes(id));
    // Group host sets by host catalog
    const hostSetGroupsObject = notAddedHostSets.reduce((obj, hostSet) => {
      if (!obj[hostSet.host_catalog_id]) {
        const hostCatalog = this.args.hostCatalogs.findBy('id', hostSet.host_catalog_id);
        obj[hostSet.host_catalog_id] = { hostCatalog, hostSets: [] };
      }
      obj[hostSet.host_catalog_id].hostSets.push(hostSet);
      return obj;
    }, {});
    const hostSetGroups = Object.values(hostSetGroupsObject);
    return hostSetGroups;
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
