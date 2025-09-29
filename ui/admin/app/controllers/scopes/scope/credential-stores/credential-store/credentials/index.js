/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { loading } from 'core/decorators/loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsIndexController extends Controller {
  @controller('scopes/scope/credential-stores/index') credentialStores;

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
    const canList = this.can.can('list model', this.credentialStore, {
      collection: 'credentials',
    });
    const canCreate = this.can.can('create model', this.credentialStore, {
      collection: 'credentials',
    });
    const resource = this.intl.t('resources.credential.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.credential.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

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
  @notifyError(({ message }) => message, { catch: true })
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
