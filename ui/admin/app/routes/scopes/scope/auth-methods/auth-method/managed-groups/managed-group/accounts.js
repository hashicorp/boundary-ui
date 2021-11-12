import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupAccountsRoute extends Route {
  // =services

  @service resourceFilterStore;

  // =methods

  /**
   * Returns the previously loaded managed group instances accounts.
   * @return {Promise{[AccountModel]}}
   */
  model() {
    const { auth_method_id, member_ids } = this.modelFor(
      'scopes.scope.auth-methods.auth-method.managed-groups.managed-group'
    );

    return this.resourceFilterStore.queryBy(
      'account',
      { id: member_ids },
      { auth_method_id }
    );
  }
}
