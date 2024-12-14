/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { debounce } from 'core/decorators/debounce';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { TYPES_CREDENTIAL_STORE } from 'api/models/credential-store';

export default class ScopesScopeCredentialStoresIndexController extends Controller {
  // =services

  @service can;
  @service router;
  @service intl;

  // =attributes

  queryParams = ['search', { types: { type: 'array' } }, 'page', 'pageSize'];

  @tracked search;
  @tracked types = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  get credStoreTypeOptions() {
    return TYPES_CREDENTIAL_STORE.map((type) => ({
      id: type,
      name: this.intl.t(`resources.credential-store.types.${type}`),
    }));
  }

  get filters() {
    return {
      allFilters: { types: this.credStoreTypeOptions },
      selectedFilters: { types: this.types },
    };
  }

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    let description;
    if (
      this.can.can('list model', this.scope, {
        collection: 'credential-stores',
      })
    ) {
      description = 'resources.credential-store.description';
    } else if (
      this.can.can('create model', this.scope, {
        collection: 'credential-stores',
      })
    ) {
      description = 'descriptions.create-but-not-list';
    } else {
      description = 'descriptions.neither-list-nor-create';
    }
    return this.intl.t(description, {
      resource: this.intl.t('resources.credential-store.title_plural'),
    });
  }

  // =actions

  /**
   * Handle save
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(credentialStore) {
    await credentialStore.save();
    if (this.can.can('read model', credentialStore)) {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store',
        credentialStore,
      );
    } else {
      await this.router.transitionTo('scopes.scope.credential-stores');
    }
    await this.router.refresh();
  }

  /**
   * Rollback changes on credential stores.
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  async cancel(credentialStore) {
    const { isNew } = credentialStore;
    credentialStore.rollbackAttributes();
    if (isNew) {
      this.router.transitionTo('scopes.scope.credential-stores');
    }
  }

  /**
   * Deletes the credential store and redirects to index
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(credentialStore) {
    await credentialStore.destroyRecord();
    this.router.replaceWith('scopes.scope.credential-stores');
    await this.router.refresh();
  }

  /**
   * Update type of credential store
   * @param {string} type
   */
  @action
  async changeType(type) {
    await this.router.replaceWith({ queryParams: { type } });
  }

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
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }
}
