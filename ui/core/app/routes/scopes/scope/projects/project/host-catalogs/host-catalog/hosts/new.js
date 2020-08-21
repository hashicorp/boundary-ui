import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostsNewRoute extends Route {

  // =methods

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {HostModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog');
    return this.store.createRecord('host', {
      type: 'static',
      scopeModel
    });
  }

  /**
   * Renders new host specific templates for header, navigation, and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/hosts/new/-header', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'header',
      model: model
    });

    this.render('_empty', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model
    });

    this.render('_empty', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model
    });
  }
}
