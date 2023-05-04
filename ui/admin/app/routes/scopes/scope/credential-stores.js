/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeCredentialStoresRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load all credential stores under current scope
   * @returns {Promise[CredentialStoreModel]}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (
      this.can.can('list model', scope, {
        collection: 'credential-stores',
      })
    ) {
      return this.store.query('credential-store', { scope_id });
    }
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
    await this.router.transitionTo(
      'scopes.scope.credential-stores.credential-store',
      credentialStore
    );
    this.refresh();
  }

  /**
   * Rollback changes on credential stores.
   * @param {CredentialStoreModel} credentialStore
   */
  @action
  cancel(credentialStore) {
    const { isNew } = credentialStore;
    credentialStore.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.credential-stores');
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
    await this.router.replaceWith('scopes.scope.credential-stores');
    this.refresh();
  }
}
