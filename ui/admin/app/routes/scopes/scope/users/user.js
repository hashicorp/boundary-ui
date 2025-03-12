/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
   * @return {Promise{UserModel}}
   */
  async model({ user_id }) {
    return this.store.findRecord('user', user_id, { reload: true });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {UserModel} user
   * @param {object} transition
   */
  redirect(user, transition) {
    const scope = this.modelFor('scopes.scope');
    if (user.scopeID !== scope.id) {
      this.router.replaceWith(transition.to.name, user.scopeID, user.id);
    }
  }
}
