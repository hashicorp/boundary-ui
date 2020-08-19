import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetRoute extends Route {
  // =methods

  /**
   * Load a host-set using current host-catalog and it's parent project scope.
   * @param {object} params
   * @param {string} params.host_set_id
   * @return {HostSetModel}
   */
  async model({ host_set_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope.projects.project');
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return this.store.findRecord('host-set', host_set_id, {
      adapterOptions: { scopeID, hostCatalogID }
    });
  }

  /**
   * Renders the host-set specific templates for header and navigation page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/host-sets');

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/-header', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'header',
      model: model
    });

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/-navigation', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model
    });
  }
}
