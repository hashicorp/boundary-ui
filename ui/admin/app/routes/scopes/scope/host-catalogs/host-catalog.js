import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsHostCatalogRoute extends Route {
  // =methods

  /**
   * Load a host catalog.
   * @param {object} params
   * @param {string} params.host_catalog_id
   * @return {HostCatalogModel}
   */
  async model({ host_catalog_id }) {
    return this.store.findRecord('host-catalog', host_catalog_id);
  }

  /**
   * Renders the host-catalog specific templates for header, navigation,
   * and actions page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/host-catalogs/host-catalog/-actions', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model,
    });
  }
}
