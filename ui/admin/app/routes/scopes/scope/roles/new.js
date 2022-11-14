import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved role.
   * @return {RoleModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('role', { scopeModel });
  }
}
