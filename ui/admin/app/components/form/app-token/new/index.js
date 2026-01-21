/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedObject } from 'tracked-built-ins';

const MAX_TTL_SECONDS = 94608000;

export default class FormAppTokenNewComponent extends Component {
  // =services

  @service intl;

  // =attributes

  @tracked showPermissionFlyout = false;
  @tracked editingPermission = false;
  @tracked selectedPermission;
  @tracked permissionErrors = null;
  indexOfEditingPermission;

  /**
   * Returns the max time to live in seconds for an app-token.
   * @type {number}
   */
  get maxTTL() {
    return MAX_TTL_SECONDS;
  }

  /**
   * Returns true if the permission has scope-related errors.
   * @type {boolean}
   */
  get hasScopeError() {
    return this.permissionErrors?.scope?.length > 0;
  }

  /**
   * Returns true if the permission has grant-related errors.
   * @type {boolean}
   */
  get hasGrantError() {
    return this.permissionErrors?.grants?.length > 0;
  }

  /**
   * Returns true if the permission has any errors.
   * @type {boolean}
   */
  get hasPermissionErrors() {
    return this.hasScopeError || this.hasGrantError;
  }

  // =methods

  /**
   * Validates the permission form for required fields.
   * @returns {object|null}
   */
  validatePermission() {
    const errors = {
      scope: [],
      grants: [],
    };

    const scopeIds = this.selectedPermission?.grant_scope_id || [];
    const grants = this.selectedPermission?.grant || [];

    // Validate scope selection
    if (scopeIds.length === 0) {
      errors.scope.push({
        message: this.intl.t(
          'resources.app-token.permission.errors.scope-required',
        ),
      });
    }

    // Validate grants - check for empty fields
    const emptyIndices = [];
    grants.forEach((grant, index) => {
      if (!grant.value?.trim()) {
        emptyIndices.push(index);
      }
    });

    // At least one non-empty grant required
    if (emptyIndices.length > 0) {
      errors.grants.push({
        message: this.intl.t(
          'resources.app-token.permission.errors.grant-required',
        ),
        indices: emptyIndices,
      });
    }

    // Return null if no errors
    return errors.scope.length > 0 || errors.grants.length > 0 ? errors : null;
  }

  /**
   * Checks if a specific grant index is invalid.
   * @param {number} index
   * @returns {boolean}
   */
  @action
  isGrantInvalid(index) {
    if (!this.permissionErrors?.grants) return false;
    return this.permissionErrors.grants.some((error) =>
      error.indices?.includes(index),
    );
  }

  /**
   * Scrolls to the first error element in the flyout.
   */
  scrollToFirstError() {
    // Wait for DOM update
    setTimeout(() => {
      const errorElement = document.querySelector(
        '[data-test-permission-flyout] [data-test-permission-error-alert], [data-test-permission-flyout] .hds-form-error',
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
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
    this.permissionErrors = null;
    this.selectedPermission = new TrackedObject({
      grant_scope_id: [],
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
    this.permissionErrors = null;
  }

  /**
   * Adds a new permission after validation.
   */
  @action
  addPermission() {
    // Validate permission
    const errors = this.validatePermission();
    if (errors) {
      this.permissionErrors = errors;
      this.scrollToFirstError();
      return;
    }

    this.permissionErrors = null;
    this.showPermissionFlyout = false;
    this.args.model.permissions = [
      ...this.args.model.permissions,
      this.selectedPermission,
    ];
    this.selectedPermission = null;
  }

  /**
   * Saves changes to an existing permission after validation.
   */
  @action
  savePermission() {
    // Validate permission
    const errors = this.validatePermission();
    if (errors) {
      this.permissionErrors = errors;
      this.scrollToFirstError();
      return;
    }

    this.permissionErrors = null;
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
    this.permissionErrors = null;
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
   * @param {number} index
   */
  @action
  removeGrant(index) {
    this.selectedPermission.grant = this.selectedPermission.grant.filter(
      (_, i) => i !== index,
    );
  }

  /**
   * Clears scope errors when user interacts with scope fields.
   */
  @action
  clearScopeErrors() {
    if (!this.permissionErrors?.scope) return;

    if (this.permissionErrors.grants?.length > 0) {
      this.permissionErrors = {
        ...this.permissionErrors,
        scope: [],
      };
    } else {
      this.permissionErrors = null;
    }
  }

  /**
   * Clears grant errors when user interacts with grant fields.
   */
  @action
  clearGrantErrors() {
    if (!this.permissionErrors?.grants) return;

    if (this.permissionErrors.scope?.length > 0) {
      this.permissionErrors = {
        ...this.permissionErrors,
        grants: [],
      };
    } else {
      this.permissionErrors = null;
    }
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
