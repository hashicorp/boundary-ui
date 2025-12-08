/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_TARGET_TCP } from 'api/models/target';

export default class ScopesScopeTargetsNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service features;
  @service can;

  // =attributes
  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, { collection: 'targets' })
    ) {
      this.router.replaceWith('scopes.scope.targets');
    }
  }

  /**
   * Creates a new unsaved target in current scope.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   * @return {TargetModel}
   */

  model({ type = TYPE_TARGET_TCP }) {
    let name, description;
    const scopeModel = this.modelFor('scopes.scope');

    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    const record = this.store.createRecord('target', {
      type,
      name,
      description,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  /**
   * Adds global scope to the context so we can check if the user has permissions to create aliases.
   * @param {Controller} controller
   */
  async setupController(controller) {
    super.setupController(...arguments);
    const globalScope = await this.store.peekRecord('scope', 'global');
    controller.set('globalScope', globalScope);
  }
}
