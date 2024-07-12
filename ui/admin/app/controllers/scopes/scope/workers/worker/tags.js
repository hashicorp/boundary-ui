/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { TAG_TYPE_CONFIG, TAG_TYPE_API } from 'api/models/worker';

export default class ScopesScopeWorkersWorkerTagsController extends Controller {
  @controller('scopes/scope/workers/index') workers;

  // =services
  @service intl;

  // =attributes

  tagTypeConfig = TAG_TYPE_CONFIG;
  tagTypeApi = TAG_TYPE_API;

  @tracked removeModal = false;
  @tracked removalConfirmation = null;
  @tracked modalTag = null;

  /**
   * Build the display name for a worker tag
   * @type {string}
   */
  get tagDisplayName() {
    return `"${this.modalTag?.key} = ${this.modalTag?.value}"`;
  }

  /**
   * Checks if user entered REMOVE to enable the remove button.
   * @type {boolean}
   */
  get isRemovalConfirmed() {
    return (
      this.removalConfirmation === this.intl.t('actions.remove').toUpperCase()
    );
  }

  /**
   * Removes selected tag from the worker.
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.worker.tags.remove.success')
  async removeApiTag() {
    await this.model.removeApiTags({
      [this.modalTag.key]: [this.modalTag.value],
    });
    this.removeModal = false;
    this.modalTag = null;
    this.removalConfirmation = null;
  }

  /**
   * Opens the remove tag modal.
   * @param {string} action
   * @param {object} apiTag
   */
  @action
  toggleModal(action, apiTag = null) {
    if (action === 'remove') {
      this.removeModal = !this.removeModal;
      this.modalTag = apiTag;
      this.removalConfirmation = null;
    }
  }
}
