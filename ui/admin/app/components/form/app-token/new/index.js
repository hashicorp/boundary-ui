/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedObject } from 'tracked-built-ins';
import { GRANT_SCOPE_THIS } from 'api/models/role';

const MAX_TTL_SECONDS = 94608000;

export default class FormAppTokenNewComponent extends Component {
  // =attributes

  @tracked showPermissionFlyout = false;
  @tracked editingPermission = false;
  @tracked selectedPermission;
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
    // For project scopes, automatically set grant_scopes to ['this'] as it's the only option
    const defaultGrantScopes = this.args.model.scope.isProject
      ? [GRANT_SCOPE_THIS]
      : [];
    this.selectedPermission = new TrackedObject({
      grant_scopes: defaultGrantScopes,
      grant: [{ value: '' }],
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
   * Adds a grant field to the selected permission.
   */
  @action
  addGrant() {
    this.selectedPermission.grant = [
      ...this.selectedPermission.grant,
      { value: '' },
    ];
  }

  /**
   * Removes a grant string from the selected permission.
   * @param {object} rowData - Data for the row being deleted
   * @param {number} rowIndex - Index of the row being deleted
   */
  @action
  removeGrant(rowData, rowIndex) {
    this.selectedPermission.grant = this.selectedPermission.grant.filter(
      (_, i) => i !== rowIndex,
    );
  }

  /**
   * Opens the permission flyout for a specific permission and scrolls to a section.
   * @param {number} index - Index of the permission in the array
   * @param {string} sectionId - ID of the section to scroll to
   * @param {Event} event - Click event to prevent default behavior
   */
  @action
  openPermissionFlyoutAndScrollTo(index, sectionId, event) {
    event?.preventDefault();

    // Open flyout with the selected permission
    this.editPermission(index);

    // Wait for flyout to render, then scroll to the specified section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Scrolls to a section within the flyout by element ID.
   * @param {string} elementId
   * @param {Event} event
   */
  @action
  scrollToSection(elementId, event) {
    event?.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
