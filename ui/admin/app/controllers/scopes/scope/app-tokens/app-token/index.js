/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAppTokensAppTokenIndexController extends Controller {
  @controller('scopes/scope/app-tokens/index') appTokens;

  // =services

  @service router;
  @service intl;
  @service store;

  // =attributes

  queryParams = ['showCreatedAppToken', 'clonedFromId', 'clonedFromStatus'];

  @tracked showCreatedAppToken = false;
  @tracked clonedFromId = null;
  @tracked clonedFromStatus = null;
  @tracked showDeleteModal = false;
  @tracked deleteConfirmation = null;
  @tracked deleteTarget = null; // 'current' or 'original'

  /**
   * Returns the appropriate translation key based on the app token status.
   * @type {string}
   */
  get statusTranslation() {
    const status = this.model?.status;
    switch (status) {
      case 'stale':
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.1',
        );
      case 'revoked':
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.2',
        );
      case 'expired':
      default:
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.0',
        );
    }
  }

  /**
   * Checks if user entered DELETE to enable the delete button.
   * @type {boolean}
   */
  get isDeleteConfirmed() {
    return (
      this.deleteConfirmation === this.intl.t('actions.delete').toUpperCase()
    );
  }

  /**
   * Returns the token name to display in the delete modal.
   * @type {string}
   */
  get deleteTokenDisplayName() {
    return this.deleteTarget === 'original'
      ? this.clonedFromId
      : this.model?.displayName;
  }

  /**
   * Returns the appropriate status text for the original token.
   * @type {string}
   */
  get originalTokenStatusText() {
    switch (this.clonedFromStatus) {
      case 'stale':
        return this.intl.t(
          'resources.app-token.messages.delete-original.status.stale',
        );
      case 'revoked':
        return this.intl.t(
          'resources.app-token.messages.delete-original.status.revoked',
        );
      case 'expired':
      default:
        return this.intl.t(
          'resources.app-token.messages.delete-original.status.expired',
        );
    }
  }

  // =actions

  /**
   * Toggle the delete modal for current token.
   */
  @action
  toggleDeleteModal() {
    this.showDeleteModal = !this.showDeleteModal;
    this.deleteConfirmation = null;
    this.deleteTarget = this.showDeleteModal ? 'current' : null;
  }

  /**
   * Toggle the delete modal for original token.
   */
  @action
  toggleDeleteOriginalModal() {
    this.showDeleteModal = !this.showDeleteModal;
    this.deleteConfirmation = null;
    this.deleteTarget = this.showDeleteModal ? 'original' : null;
  }

  /**
   * Handle the delete action based on the target.
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(() => 'notifications.delete-success')
  async handleDelete() {
    this.showDeleteModal = false;
    this.deleteConfirmation = null;

    if (this.deleteTarget === 'original') {
      const originalToken = await this.store.findRecord(
        'app-token',
        this.clonedFromId,
      );
      await originalToken.destroyRecord();
      this.deleteTarget = null;
      this.router.replaceWith({
        queryParams: { clonedFromId: null, clonedFromStatus: null },
      });
    } else {
      this.deleteTarget = null;
      await this.appTokens.delete(this.model);
    }
  }

  /**
   * Reset query param `showCreatedAppToken` to false.
   */
  @action
  async resetAppTokenModal() {
    await this.router.replaceWith({
      queryParams: { showCreatedAppToken: false },
    });
    this.router.refresh('scopes.scope.app-tokens.app-token', this.model.id);
  }

  /**
   * Dismiss the cloned from banner by clearing the queryParams.
   */
  @action
  dismissClonedFromBanner() {
    this.router.replaceWith({
      queryParams: { clonedFromId: null, clonedFromStatus: null },
    });
  }

  /**
   * Navigate to clone the current app token.
   */
  @action
  navigateToClone() {
    this.router.transitionTo('scopes.scope.app-tokens.new', {
      queryParams: { cloneAppToken: this.model.id },
    });
  }
}
