import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostsHostRoute extends Route {
  // =methods

  /**
   * Load a host using current host-catalog and it's parent project scope.
   * @param {object} params
   * @param {string} params.host_id
   * @return {HostModel}
   */
  async model({ host_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope.projects.project');
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return this.store.findRecord('host', host_id, {
      reload: true,
      adapterOptions: { scopeID, hostCatalogID }
    });
  }

  /**
   * Renders the host specific templates for header, navigation, and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/hosts/-header', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'header',
      model: model
    });

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/hosts/-navigation', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model
    });

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/hosts/-actions', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model
    });
  }
}
