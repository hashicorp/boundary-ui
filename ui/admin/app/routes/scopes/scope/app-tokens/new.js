/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeAppTokensNewRoute extends Route {
  // =services

  @service can;
  @service router;
  @service store;

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, { collection: 'app-tokens' })
    ) {
      this.router.replaceWith('scopes.scope.app-tokens');
    }
  }

  /**
   * Creates new app-token record.
   * @returns {AppTokenModel}
   */
  async model({ cloneAppToken }) {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('app-token');
    record.scopeModel = scopeModel;

    if (cloneAppToken) {
      const originalAppToken = await this.store.findRecord(
        'app-token',
        cloneAppToken,
      );
      record.name = `Clone_${originalAppToken.name}`;
      record.description = originalAppToken.description;
      record.time_to_live_seconds = originalAppToken.time_to_live_seconds;
      record.time_to_stale_seconds = originalAppToken.time_to_stale_seconds;
      record.permissions = new TrackedArray(originalAppToken.permissions);
    } else {
      record.time_to_live_seconds = 5184000; // Set default TTL
      record.permissions = new TrackedArray([]);
    }

    return record;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('cloneAppToken', null);
    }
  }
}
