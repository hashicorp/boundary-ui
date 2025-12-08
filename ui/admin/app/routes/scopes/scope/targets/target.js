/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =methods

  /**
   * Load a target.
   * @param {object} params
   * @param {string} params.target_id
   * @return {Promise{TargetModel}}
   */
  async model({ target_id }) {
    return this.store.findRecord('target', target_id, { reload: true });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {TargetModel} target
   * @param {object} transition
   */
  redirect(target, transition) {
    const scope = this.modelFor('scopes.scope');
    if (target.scopeID !== scope.id) {
      this.router.replaceWith(transition.to.name, target.scopeID, target.id);
    }
  }
}
