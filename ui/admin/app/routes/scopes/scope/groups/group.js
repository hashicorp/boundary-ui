/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsGroupRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a group in current scope.
   * @param {object} params
   * @param {string} params.group_id
   * @return {groupModel}
   */
  async model({ group_id }) {
    return this.store.findRecord('group', group_id, { reload: true });
  }

  redirect(group, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read group', group, {
        resource_id: group.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(transition.to.name, group.scopeID, group.id);
    }
  }
}
