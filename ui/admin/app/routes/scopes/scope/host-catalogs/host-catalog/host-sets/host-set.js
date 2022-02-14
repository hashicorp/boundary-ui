import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetRoute extends Route {
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
   * Renders the host-set specific templates for header, navigation, and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/host-catalogs/host-catalog/host-sets/host-set/-header',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'header',
        model: model,
      }
    );

    this.render(
      'scopes/scope/host-catalogs/host-catalog/host-sets/host-set/-navigation',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'navigation',
        model: model,
      }
    );

    this.render(
      'scopes/scope/host-catalogs/host-catalog/host-sets/host-set/-actions',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'actions',
        model: model,
      }
    );
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
