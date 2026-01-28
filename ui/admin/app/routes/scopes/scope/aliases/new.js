/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_ALIAS_TARGET } from 'api/models/alias';

export default class ScopesScopeAliasesNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, { collection: 'aliases' })
    ) {
      this.router.replaceWith('scopes.scope.aliases');
    }
  }

  /**
   * Creates a new unsaved alias.
   * @return {AliasModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('alias', {
      type: TYPE_ALIAS_TARGET,
    });
    record.scopeModel = scopeModel;
    return record;
  }
}
