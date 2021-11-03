import Route from '@ember/routing/route';
import { setupFilters } from '../../../utils/setupFilters';

export default class ScopesScopeAuthMethodsIndexRoute extends Route {
  // =methods

  /**
   * Adds the scope to the controller context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const scopeModel = this.modelFor('scopes.scope');
    const route = 'scopes.scope.auth-methods'
    controller.setProperties({
      scopeModel,
       filters: {
        type: {
          items: ['password', 'oidc'],
          selectedItems: setupFilters(this, route,'type')
        },
        is_primary: {
          items: [true, false],
          selectedItems: setupFilters(this, route,'is_primary')
        }
      }
    });
  }
}
