import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsHostCatalogHostsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {HostModel}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return this.store.createRecord('host', {
      type: 'static',
      host_catalog_id,
    });
  }

  /**
   * Renders new host specific templates for header, navigation,
   * and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/host-catalogs/host-catalog/hosts/new/-header', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'header',
      model: model,
    });

    this.render('_empty', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model,
    });

    this.render('_empty', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model,
    });
  }
}
