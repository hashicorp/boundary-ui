/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { GRANT_SCOPE_KEYWORDS } from 'api/models/role';

export default class ScopesScopeAppTokensAppTokenPermissionsController extends Controller {
  @service store;

  @tracked showGrantsFlyout = false;
  @tracked showActiveScopesFlyout = false;
  @tracked showDeletedScopesFlyout = false;
  @tracked selectedPermission = null;

  /**
   * Returns an array of scope objects (either fetched models or keyword objects)
   * based on the selectedPermission's grant_scopes.
   * @type {Array}
   */
  get activeScopesList() {
    if (!this.selectedPermission?.grant_scopes) {
      return [];
    }

    return this.selectedPermission.grant_scopes.map((scopeId) => {
      if (GRANT_SCOPE_KEYWORDS.includes(scopeId)) {
        if (scopeId === 'this') {
          const thisScope = this.store.peekRecord('scope', this.model.scope.id);
          return {
            id: scopeId,
            displayName: thisScope ? thisScope.displayName : 'this',
            scopeId: thisScope.id,
          };
        }

        // For other keywords (children, descendants), show em dash
        return {
          id: scopeId,
          displayName: '—',
          isKeyword: true,
        };
      }

      const scope = this.store.peekRecord('scope', scopeId);
      return scope || { id: scopeId, displayName: scopeId };
    });
  }

  /**
   * Returns an array of deleted scope objects from selectedPermission's deleted_scopes.
   * @type {Array}
   */
  get deletedScopesList() {
    return this.selectedPermission?.deleted_scopes || [];
  }

  /**
   * Opens the grants flyout for a specific permission.
   * @param {object} permission
   */
  @action
  openGrantsFlyout(permission) {
    this.selectedPermission = permission;
    this.showGrantsFlyout = true;
  }

  /**
   * Closes the grants flyout.
   */
  @action
  closeGrantsFlyout() {
    this.showGrantsFlyout = false;
    this.selectedPermission = null;
  }

  /**
   * Opens the active scopes flyout for a specific permission.
   * @param {object} permission
   */
  @action
  openActiveScopesFlyout(permission) {
    this.selectedPermission = permission;
    this.showActiveScopesFlyout = true;
  }

  /**
   * Closes the active scopes flyout.
   */
  @action
  closeActiveScopesFlyout() {
    this.showActiveScopesFlyout = false;
    this.selectedPermission = null;
  }

  /**
   * Opens the deleted scopes flyout for a specific permission.
   * @param {object} permission
   */
  @action
  openDeletedScopesFlyout(permission) {
    this.selectedPermission = permission;
    this.showDeletedScopesFlyout = true;
  }

  /**
   * Closes the deleted scopes flyout.
   */
  @action
  closeDeletedScopesFlyout() {
    this.showDeletedScopesFlyout = false;
    this.selectedPermission = null;
  }
}
