/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsNewController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;
  @controller('scopes/scope/auth-methods/auth-method/managed-groups/index')
  managedGroups;
}
