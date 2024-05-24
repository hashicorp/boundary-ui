/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetAddHostsController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Redirect to hosts in host set as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts',
    );
  }

  /**
   * Saves host IDs on the host set.
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addHosts(hostSet, hostIDs) {
    await hostSet.addHosts(hostIDs);
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts',
    );
  }
}
