/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsNewRoute extends Route {
  // =services

  @service store;
  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current scope.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   * @return {HostCatalogModel}
   */
  model({ type: compositeType = 'static' }) {
    const scopeModel = this.modelFor('scopes.scope');
    let name, description, disable_credential_rotation;
    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }
    if (compositeType === 'azure') {
      disable_credential_rotation = true;
    }
    const record = this.store.createRecord('host-catalog', {
      compositeType,
      name,
      description,
      disable_credential_rotation,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  /**
   * Update type of host catalog
   * @param {string} type
   */
  @action
  changeType(type) {
    if (type === 'plugin') type = 'aws';
    this.router.replaceWith({ queryParams: { type } });
  }
}
