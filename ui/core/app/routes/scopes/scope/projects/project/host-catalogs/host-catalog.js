import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogRoute extends Route {

  // =methods

  /**
   * Load a host catalog.
   * @param {object} params
   * @param {string} params.host_catalog_id
   * @return {HostCatalogModel}
   */
  async model({ host_catalog_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('host-catalog', host_catalog_id, {
      adapterOptions: { scopeID },
    });
  }

    /**
   * Renders the host-catalog specific templates for header, navigation, and actions page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    this.render('scopes/scope/projects/project/host-catalogs/host-catalog');

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/-header', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'header',
      model: model
    });

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/-navigation', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model
    });

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/-actions', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model
    });
  }
}
