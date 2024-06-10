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

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesIndexController extends Controller {
  @controller('scopes/scope/credential-stores/index') credentialStores;

  // =services

  @service can;
  @service router;

  // =actions

  /**
   * Rollback changes on a credential library.
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  async cancel(credentialLibrary) {
    const { isNew } = credentialLibrary;
    credentialLibrary.rollbackAttributes();
    if (isNew)
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries',
      );
  }

  /**
   * Handle save of a credential library
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(credentialLibrary) {
    await credentialLibrary.save();
    if (this.can.can('read model', credentialLibrary)) {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries.credential-library',
        credentialLibrary,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries',
      );
    }
    await this.router.refresh();
  }

  /**
   * Handle delete of a credential library
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(credentialLibrary) {
    await credentialLibrary.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.credential-stores.credential-store.credential-libraries',
    );
    await this.router.refresh();
  }

  /**
   * Copies the contents of array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {credentialLibraryModel} credentialLibrary
   */
  @action
  edit(credentialLibrary) {
    const { critical_options, extensions } = credentialLibrary;
    credentialLibrary.critical_options = structuredClone(critical_options);
    credentialLibrary.extensions = structuredClone(extensions);
  }

  /**
   * Update type of credential library
   * @param {string} type
   */
  @action
  async changeType(type) {
    await this.router.replaceWith({ queryParams: { type } });
  }
}
