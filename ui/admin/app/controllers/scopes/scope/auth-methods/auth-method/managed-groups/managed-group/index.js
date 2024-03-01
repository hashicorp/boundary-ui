import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupIndexController extends Controller {
  @controller('scopes/scope/auth-methods') authMethods;
  @controller('scopes/scope/auth-methods/auth-method/managed-groups')
  managedGroups;
}
