import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsRoute extends Route {
  /**
   *
   * @returns {Promise{[ManagedGroupsModel]}}
   */
  model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    return this.store.query('managed-group', { auth_method_id });
  }

  // =actions
  /**
   * Rollback changes on a managed group.
   * @param {ManagedGroupModel} managedGroup
   */
  @action
  cancel(managedGroup) {
    const { isNew } = managedGroup;
    managedGroup.rollbackAttributes();
    if (isNew) {
      this.transitionTo('scopes.scope.auth-methods.auth-method.managed-groups');
    }
  }
}
