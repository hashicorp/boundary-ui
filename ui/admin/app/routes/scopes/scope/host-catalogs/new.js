/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeHostCatalogsNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service abilities;

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
      this.abilities.cannot('create model', scopeModel, {
        collection: 'host-catalogs',
      })
    ) {
      this.router.replaceWith('scopes.scope.host-catalogs');
    }
  }

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
}
