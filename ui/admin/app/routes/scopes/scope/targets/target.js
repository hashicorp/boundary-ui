/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a target.
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  async model({ target_id }) {
    return this.store.findRecord('target', target_id, { reload: true });
  }

  redirect(target, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read target', target, {
        resource_id: target.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(transition.to.name, target.scopeID, target.id);
    }
  }
}
