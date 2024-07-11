/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsIndexController extends Controller {
  @controller('scopes/scope/credential-stores/index') credentialStores;

  // =services

  @service can;
  @service router;

  // =actions

  /**
   * Rollback changes on a credential.
   * @param {CredentialModel} credential
   */
  @action
  async cancel(credential) {
    const { isNew } = credential;
    credential.rollbackAttributes();
    if (isNew)
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credentials',
      );
  }

  /**
   * Handle save of a credential
   * @param {CredentialModel} credential
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(credential) {
    await credential.save();
    if (this.can.can('read credential', credential)) {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credentials.credential',
        credential,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credentials',
      );
    }
    await this.router.refresh();
  }
  /**
   * Handle delete of a credential
   * @param {Credential} credential
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(credential) {
    await credential.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.credential-stores.credential-store.credentials',
    );
    await this.router.refresh();
  }

  /**
   * Update type of credential
   * @param {string} type
   */
  @action
  async changeType(type) {
    await this.router.replaceWith({ queryParams: { type } });
  }
}
