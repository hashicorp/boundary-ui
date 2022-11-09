import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a host-set using current host-catalog and its parent scope.
   * @param {object} params
   * @param {string} params.host_set_id
   * @return {HostSetModel}
   */
  async model({ host_set_id }) {
    return this.store.findRecord('host-set', host_set_id, { reload: true });
  }

  /**
   * Adds a string item to array `property` on the passed `filter`.

   * @param {hostSetModel} hostSet
   * @param {string} property
   * @param {string} value
   */
  @action
  async addStringItem(hostSet, property, value) {
    const array = hostSet.get(property);
    array.addObject({ value });
  }

  /**
   * Removes an item from array `property` at `index` on the
   * passed `hostSet`.
   * @param {hostSetModel} hostSet
   * @param {string} property
   * @param {number} index
   */
  @action
  async removeItemByIndex(hostSet, property, index) {
    const array = hostSet.get(property);
    array.removeAt(index);
  }
}
