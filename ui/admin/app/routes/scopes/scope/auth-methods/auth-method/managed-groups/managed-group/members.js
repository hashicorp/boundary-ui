import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupMembersRoute extends Route {
  // =services

  @service resourceFilterStore;

  // =methods

  /**
   * Returns the previously loaded managed group instances memebrs.
   * @return {Promise{[AccountModel]}}
   */
  async model() {
    const managedGroup = this.modelFor(
      'scopes.scope.auth-methods.auth-method.managed-groups.managed-group'
    );
    const { auth_method_id, member_ids } = managedGroup;

    return {
      managedGroup,
      members: await this.resourceFilterStore.queryBy(
        'account',
        { id: member_ids },
        { auth_method_id }
      ),
    };
  }
}
