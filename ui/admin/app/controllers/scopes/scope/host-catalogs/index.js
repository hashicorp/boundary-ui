/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsIndexController extends Controller {
  // =services

  @service router;
  @service can;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

  // =actions

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Rollback changes on host catalog.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  cancel(hostCatalog) {
    const { isNew } = hostCatalog;
    hostCatalog.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.host-catalogs');
  }

  /**
   * Handle save.
   * @param {HostCatalogModel} hostCatalog
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(hostCatalog) {
    await hostCatalog.save();
    if (this.can.can('read host-catalog', hostCatalog)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog',
        hostCatalog,
      );
    } else {
      await this.router.transitionTo('scopes.scope.host-catalogs');
    }
    await this.router.refresh();
  }

  /**
   * Deletes the host catalog and redirects to index.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(hostCatalog) {
    await hostCatalog.destroyRecord();
    this.router.replaceWith('scopes.scope.host-catalogs');
    await this.router.refresh();
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

  /**
   * Updates credential type
   * @param {model} hostcatalog
   * @param {string} credentialType
   */
  @action
  changeCredentialType(hostCatalog, credentialType) {
    hostCatalog.credentialType = credentialType;
  }
}
