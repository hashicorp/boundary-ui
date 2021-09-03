import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsHostCatalogHostsIndexRoute extends Route {
  setupController(controller) {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    super.setupController(...arguments);
    controller.setProperties({ hostCatalog });
  }
}
