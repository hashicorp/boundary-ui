import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsNewController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;
  @controller('scopes/scope/auth-methods/auth-method/managed-groups/index')
  managedGroups;
}
