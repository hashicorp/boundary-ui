/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsNewRoute extends Route {
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
    if (this.can.cannot('create model', scopeModel, { collection: 'groups' })) {
      this.router.replaceWith('scopes.scope.groups');
    }
  }

  /**
   * Creates a new unsaved group.
   * @return {GroupModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('group');
    record.scopeModel = scopeModel;
    return record;
  }
}
