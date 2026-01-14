/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedObject } from 'tracked-built-ins';

const MAX_TTL_SECONDS = 94608000;

export default class FormAppTokenNewComponent extends Component {
  // =attributes

  @tracked showPermissionFlyout = false;
  @tracked editingPermission = false;
  @tracked selectedPermission;
  @tracked showConfirmCreateModal = false;

  indexOfEditingPermission;

  /**
   * Returns the max time to live in seconds for an app-token.
   * @type {number}
   */
  get maxTTL() {
    return MAX_TTL_SECONDS;
  }

  // =actions

  /**
   * Sets time for time to live and time to stale fields on an app-token.
   * @param {string} field
   * @param {number} time
   */
  @action
  updateTime(field, time) {
    this.args.model[field] = time;
  }

  /**
   * Toggles open the permissions flyout and initializes a new permission object.
   */
  @action
  openPermissionFlyout() {
    this.showPermissionFlyout = true;
    this.selectedPermission = new TrackedObject({
      grant_scope_id: [],
    });
  }

  /**
   * Toggles close the permission flyout and resets tracked values.
   */
  @action
  closePermissionFlyout() {
    this.showPermissionFlyout = false;
    this.editingPermission = false;
    this.selectedPermission = null;
  }

  /**
   * Adds a new permission.
   */
  @action
  addPermission() {
    this.showPermissionFlyout = false;
    this.args.model.permissions = [
      ...this.args.model.permissions,
      this.selectedPermission,
    ];
    this.selectedPermission = null;
  }

  /**
   * Saves changes to an existing permission.
   */
  @action
  savePermission() {
    this.showPermissionFlyout = false;
    this.editingPermission = false;
    this.args.model.permissions = this.args.model.permissions.filter(
      (_, i) => i !== this.indexOfEditingPermission,
    );
    this.args.model.permissions = [
      ...this.args.model.permissions,
      this.selectedPermission,
    ];
    this.selectedPermission = null;
  }

  /**
   * Toggles open the permissions flyout in the case that a permission is
   * being edited.
   * @param {number} index
   */
  @action
  editPermission(index) {
    this.selectedPermission = new TrackedObject(
      this.args.model.permissions[index],
    );
    this.showPermissionFlyout = true;
    this.editingPermission = true;
    this.indexOfEditingPermission = index;
  }

  /**
   * Removes a permission from the permissions object.
   * @param {number} index
   */
  @action
  deletePermission(index) {
    this.args.model.permissions = this.args.model.permissions.filter(
      (_, i) => i !== index,
    );
  }

  /**
   * Toggles `showConfirmCreateModal` to true or false.
   */
  @action
  toggleConfirmCreate() {
    this.showConfirmCreateModal = !this.showConfirmCreateModal;
  }
}
