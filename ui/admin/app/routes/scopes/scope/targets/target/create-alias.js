/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_ALIAS_TARGET } from 'api/models/alias';

export default class ScopesScopeTargetsTargetCreateAliasRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved alias.
   * @return {AliasModel}
   */
  model() {
    const scopeModel = this.store.peekRecord('scope', 'global');
    const { id } = this.modelFor('scopes.scope.targets.target');
    const record = this.store.createRecord('alias', {
      type: TYPE_ALIAS_TARGET,
      destination_id: id,
    });
    record.scopeModel = scopeModel;
    return record;
  }
}
