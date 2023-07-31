/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load managed group by ID.
   * @param {object} params
   * @param {string} params.managed_group_id
   * @returns {ManagedGroupModel}
   */
  model({ managed_group_id }) {
    return this.store.findRecord('managed-group', managed_group_id, {
      reload: true,
    });
  }

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {managedGroupModel} managedGroup
   */
  @action
  edit(managedGroup) {
    if (managedGroup.group_names) {
      managedGroup.group_names = structuredClone(managedGroup.group_names);
    }
  }
}
