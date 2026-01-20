/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import {
  TAG_TYPE_CONFIG,
  TAG_TYPE_API,
  HCP_MANAGED_KEY,
} from 'api/models/worker';

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

  /**
   * Determines if a config tag is managed by HCP
   * @param {object} tag
   * @returns {boolean}
   */
  isHcpManaged(tag) {
    return tag.key === HCP_MANAGED_KEY && tag.value === 'true';
  }

  updateApiTags() {
    const apiTags = structuredClone(this.model.api_tags);
    const { key, value } = this.modalTag;
    const editedValues = this.editValue.split(',').map((value) => value.trim());

    // remove the old value
    apiTags[key] = apiTags[key].filter((val) => val !== value);

    // remove key if value is empty array
    if (apiTags[key].length === 0) {
      delete apiTags[key];
    }

    // add new key/value to apiTags
    if (this.editKey in apiTags) {
      apiTags[this.editKey] = [
        ...new Set([...apiTags[this.editKey], ...editedValues]),
      ];
    } else {
      apiTags[this.editKey] = editedValues;
    }

    return apiTags;
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
   * Toggles the remove tag modal.
   * @param {object} apiTag
   */
  @action
  toggleRemoveModal(apiTag) {
    this.removeModal = !this.removeModal;
    this.modalTag = apiTag;
    this.removalConfirmation = null;
  }

  /**
   * Toggles the edit tag modal.
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
