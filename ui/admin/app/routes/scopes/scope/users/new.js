/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeUsersNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (this.can.cannot('create model', scopeModel, { collection: 'users' })) {
      this.router.transitionTo('scopes.scope.users', scopeModel.id);
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
