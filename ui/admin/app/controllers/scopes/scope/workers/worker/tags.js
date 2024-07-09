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
import { TrackedObject } from 'tracked-built-ins';

export default class ScopesScopeWorkersWorkerTagsController extends Controller {
  @controller('scopes/scope/workers/index') workers;

  // =services
  @service intl;

  tagTypeConfig = TAG_TYPE_CONFIG;
  tagTypeApi = TAG_TYPE_API;

  modals = new TrackedObject({
    remove: false,
    edit: false,
  });
  @tracked removalConfirmation = null;
  @tracked apiTagToRemove = null;

  /**
   * Build the display name for a worker tag
   * @returns {string}
   */
  get tagDisplayName() {
    return `"${this.apiTagToRemove?.key} = ${this.apiTagToRemove?.value}"`;
  }

  /**
   * Checks if user entered REMOVE to enable the remove button.
   * @returns {boolean}
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
      [this.apiTagToRemove.key]: [this.apiTagToRemove.value],
    });
    this.modals.remove = false;
    this.apiTagToRemove = null;
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
      this.modals.remove = !this.modals.remove;
      this.apiTagToRemove = apiTag;
      this.removalConfirmation = null;
    }
  }
}
