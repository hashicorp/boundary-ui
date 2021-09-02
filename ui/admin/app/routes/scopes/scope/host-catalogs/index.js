import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsIndexRoute extends Route {
  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
