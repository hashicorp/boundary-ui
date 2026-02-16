/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostsIndexController extends Controller {
  @controller('scopes/scope/host-catalogs/index') hostCatalogs;

  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.hostCatalog, {
      collection: 'hosts',
    });
    const canCreate = this.can.can('create model', this.hostCatalog, {
      collection: 'hosts',
    });
    const resource = this.intl.t('resources.host.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.host.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Rollback changes on a host.
   * @param {HostModel} host
   */
  @action
  cancel(host) {
    const { isNew } = host;
    host.rollbackAttributes();
    if (isNew) {
      this.router.transitionTo('scopes.scope.host-catalogs.host-catalog.hosts');
    }
  }

  /**
   * Handle save of a host.
   * @param {HostModel} host
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(host) {
    await host.save();
    if (this.can.can('read model', host)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts.host',
        host,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts',
      );
    }
    await this.router.refresh();
  }

  /**
   * Delete host in current scope and redirect to index.
   * @param {HostModel} host
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(host) {
    await host.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.hosts',
    );
    await this.router.refresh();
  }
}
