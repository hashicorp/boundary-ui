/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
   * @return {Promise{GroupModel}}
   */
  async model({ group_id }) {
    return this.store.findRecord('group', group_id, { reload: true });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {GroupModel} credentialStore
   * @param {object} transition
   */
  redirect(group, transition) {
    const scope = this.modelFor('scopes.scope');
    if (group.scopeID !== scope.id) {
      this.router.replaceWith(transition.to.name, group.scopeID, group.id);
    }
  }
}
