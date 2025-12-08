/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeUsersNewRoute extends Route {
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
    if (this.can.cannot('create model', scopeModel, { collection: 'users' })) {
      this.router.replaceWith('scopes.scope.users');
    }
  }

  /**
   * Creates a new unsaved user.
   * @return {UserModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('user');
    record.scopeModel = scopeModel;
    return record;
  }
}
