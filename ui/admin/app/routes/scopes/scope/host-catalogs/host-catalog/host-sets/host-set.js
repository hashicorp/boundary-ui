/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/route-info';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a host-set using current host-catalog and its parent scope.
   * @param {object} params
   * @param {string} params.host_set_id
   * @return {HostSetModel}
   */
  async model({ host_set_id }) {
    return this.store.findRecord('host-set', host_set_id, { reload: true });
  }

  redirect(hostSet, transition) {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    const { host_catalog_id } = hostSet;
    if (
      this.can.cannot('read host-set', hostSet, {
        resource_id: host_catalog_id,
        collection_id: hostCatalog.id,
      })
    ) {
      let paramValues = paramValueFinder('host-set', transition.to.parent);
      this.router.transitionTo(
        transition.to.name,
        host_catalog_id,
        hostSet.id,
        ...paramValues
      );
    }
  }

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself as well as its members are all new.
   *
   * @param {hostSetModel} hostSet
   */
  @action
  edit(hostSet) {
    if (hostSet.preferred_endpoints) {
      hostSet.preferred_endpoints = structuredClone(
        hostSet.preferred_endpoints
      );
    }
    if (hostSet.filters) {
      hostSet.filters = structuredClone(hostSet.filters);
    }
  }

  /**
   * Adds a string item `{ value }` to array `property` on passed `hostSet`.
   * @param {hostSetModel} hostSet
   * @param {string} property
   * @param {string} value
   */
  @action
  async addStringItem(hostSet, property, value) {
    const array = [...hostSet.get(property), { value }];
    hostSet.set(property, array);
  }

  /**
   * Removes an item from array `property` at `index` on the
   * passed `hostSet`.
   * @param {hostSetModel} hostSet
   * @param {string} property
   * @param {number} index
   */
  @action
  async removeItemByIndex(hostSet, property, index) {
    const array = hostSet.get(property).filter((item, i) => i !== index);
    hostSet.set(property, array);
  }
}
