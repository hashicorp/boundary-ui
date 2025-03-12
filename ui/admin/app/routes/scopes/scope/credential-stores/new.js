/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresNewRoute extends Route {
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
      this.can.cannot('create model', scopeModel, {
        collection: 'credential-stores',
      })
    ) {
      this.router.replaceWith('scopes.scope.credential-stores');
    }
  }

  /**
   * Creates a new unsaved credential-store
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   */
  model({ type = 'static' }) {
    const scopeModel = this.modelFor('scopes.scope');
    let name, description;
    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }
    //hide static type credential stores if the feature flag isn't enabled
    if (!this.features.isEnabled('static-credentials')) {
      type = 'vault';
    }
    const record = this.store.createRecord('credential-store', {
      type,
      name,
      description,
    });
    record.scopeModel = scopeModel;
    return record;
  }
}
