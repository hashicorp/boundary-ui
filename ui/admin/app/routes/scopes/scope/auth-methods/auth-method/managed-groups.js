/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsRoute extends Route {
  // =services

  @service store;
  @service can;

  //=methods

  /**
   *
   * @returns {Promise{[ManagedGroupsModel]}}
   */
  async model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    const canListManagedGroups = this.can.can('list model', authMethod, {
      collection: 'managed-groups',
    });
    let managedGroups;

    if (canListManagedGroups) {
      managedGroups = await this.store.query('managed-group', {
        auth_method_id,
      });
    }

    return {
      authMethod,
      managedGroups,
    };
  }
}
