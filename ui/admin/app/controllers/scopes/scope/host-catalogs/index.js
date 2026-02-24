/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { TYPE_CREDENTIAL_STATIC } from 'api/models/host-catalog';

export default class ScopesScopeHostCatalogsIndexController extends Controller {
  // =services

  @service abilities;
  @service intl;
  @service router;

  // =attributes

  queryParams = [
    'search',
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.abilities.can('list model', this.scope, {
      collection: 'host-catalogs',
    });
    const canCreate = this.abilities.can('create model', this.scope, {
      collection: 'host-catalogs',
    });
    const resource = this.intl.t('resources.host-catalog.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.host-catalog.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
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
    // If the role_arn is empty, then the credential type should be static
    if (!hostCatalog.role_arn) {
      hostCatalog.credentialType = TYPE_CREDENTIAL_STATIC;
    }
    await hostCatalog.save();
    if (this.abilities.can('read host-catalog', hostCatalog)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog',
        hostCatalog,
      );
    } else {
      this.router.transitionTo('scopes.scope.host-catalogs');
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
   * @param {model} hostCatalog
   * @param {string} credentialType
   */
  @action
  changeCredentialType(hostCatalog, credentialType) {
    hostCatalog.credentialType = credentialType;
  }

  /**
   * Set sort values and sets page to 1
   * @param {string} sortBy
   * @param {string} sortOrder
   */
  @action
  onSort(sortBy, sortOrder) {
    this.sortAttribute = sortBy;
    this.sortDirection = sortOrder;
    this.page = 1;
  }
}
