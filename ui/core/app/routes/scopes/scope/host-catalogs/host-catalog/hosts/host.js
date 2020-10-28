import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsHostCatalogHostsHostRoute extends Route {
  // =methods

  /**
   * Load a host using current host-catalog and it's parent scope.
   * @param {object} params
   * @param {string} params.host_id
   * @return {HostModel}
   */
  async model({ host_id }) {
    return this.store.findRecord('host', host_id, { reload: true });
  }

  /**
   * Renders the host specific templates for header, navigation, and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/host-catalogs/host-catalog/hosts/host/-header',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'header',
        model: model,
      }
    );

    this.render(
      'scopes/scope/host-catalogs/host-catalog/hosts/host/-navigation',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'navigation',
        model: model,
      }
    );

    this.render(
      'scopes/scope/host-catalogs/host-catalog/hosts/host/-actions',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'actions',
        model: model,
      }
    );
  }
}
