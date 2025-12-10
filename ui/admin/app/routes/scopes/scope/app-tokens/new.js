/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedObject } from 'tracked-built-ins';

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
  model() {
    const scopeModel = this.modelFor('scopes.scope');

    const record = this.store.createRecord('app-token');
    record.time_to_live_seconds = 5184000; // Set default TTL
    record.permissions = new TrackedObject({ addedPermissions: [] });
    record.scopeModel = scopeModel;

    return record;
  }
}
