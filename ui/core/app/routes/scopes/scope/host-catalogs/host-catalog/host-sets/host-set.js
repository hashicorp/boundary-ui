import Route from '@ember/routing/route';

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
}
