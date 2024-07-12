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
  @tracked editModal = false;
  @tracked modalTag = null;
  @tracked editKey = null;
  @tracked editValue = null;

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

  updateApiTags() {
    const currentApiTags = structuredClone(this.model.api_tags);
    const { key, value } = this.modalTag;
    const editedValues = this.editValue.split(',').map((value) => value.trim());

    // remove the old value
    currentApiTags[key] = currentApiTags[key].filter((val) => val !== value);

    // remove key if value is empty array
    if (currentApiTags[key].length === 0) {
      delete currentApiTags[key];
    }

    // add the new value under the new key
    if (this.editKey in currentApiTags) {
      // if the new key exist, add the new values to
      // its array if not already present
      if (!currentApiTags[this.editKey].includes(this.editValue)) {
        // currentApiTags[this.editKey].push(this.editValue);
        editedValues.forEach((value) => {
          if (!currentApiTags[this.editKey].includes(value)) {
            currentApiTags[this.editKey].push(value);
          }
        });
      }
    } else {
      // add to api tags if does not exist
      currentApiTags[this.editKey] = editedValues;
    }

    return currentApiTags;
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
    this.removalConfirmation = null;
  }

  /**
   * Edits selected tag on the worker
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.worker.tags.edit.success')
  async editApiTag() {
    const apiTags = this.updateApiTags();
    await this.model.setApiTags(apiTags);
    this.editModal = false;
  }

  /**
   * Opens the remove tag modal.
   * @param {object} apiTag
   */
  @action
  toggleRemoveModal(apiTag) {
    this.removeModal = !this.removeModal;
    this.modalTag = apiTag;
    this.removalConfirmation = null;
  }

  /**
   * Opens the edit tag modal.
   * @param {object} apiTag
   */
  @action
  toggleEditModal(apiTag) {
    this.editModal = !this.editModal;
    this.modalTag = apiTag;
    this.editKey = apiTag?.key;
    this.editValue = apiTag?.value;
  }
}
