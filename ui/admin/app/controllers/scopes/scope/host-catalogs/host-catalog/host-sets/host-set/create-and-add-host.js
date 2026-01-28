/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetCreateAndAddHostController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Saves host and add it to current host set.
   * @param {HostSetModel,HostModel} model
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(host) {
    await host.save();
    await this.hostSet.addHost(host.id);
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts',
    );
  }

  /**
   * Rollback changes on a host.
   * @param {HostModel} host
   */
  @action
  cancel(host) {
    const { isNew } = host;
    host.rollbackAttributes();
    if (isNew) {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts',
      );
    }
  }
}
