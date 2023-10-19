/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeUsersUserRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a user in current scope.
   * @param {object} params
   * @param {string} params.user_id
   * @return {UserModel}
   */
  async model({ user_id }) {
    return this.store.findRecord('user', user_id);
  }

  redirect(user, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read user', user, {
        resource_id: user.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(transition.to.name, user.scopeID, user.id);
    }
  }
}
