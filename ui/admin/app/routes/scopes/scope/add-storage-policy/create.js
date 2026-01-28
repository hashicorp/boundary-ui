/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_POLICY } from 'api/models/policy';

export default class ScopesScopeAddStoragePolicyCreateRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved policy.
   * @return {Policy}
   */
  model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const scopeModel = this.store.peekRecord('scope', scope_id);
    const record = this.store.createRecord('policy', {
      type: TYPE_POLICY,
    });
    record.scopeModel = scopeModel;
    return record;
  }
}
