/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedRoleModel from '../generated/models/role';
import { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class RoleModel extends GeneratedRoleModel {
  // =services

  @service store;

  // =attributes

  /**
   * Principals are users and groups assigned to a role.  They are represented
   * as references to User and Group instances.  Since Ember Data relationships
   * are wanting, we do not model these as a polymorphic relationship as might
   * see obvious.  Instead, the application layer is expected to load referenced
   * users and groups as needed.
   */
  @attr('array', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  principals;

  /**
   * Grant strings are read-only.  But grants can be persisted via a dedicated
   * call to `saveGrantStrings(grants)`.
   */
  @attr({ readOnly: true, emptyArrayIfMissing: true }) grant_strings;

  /**
   * Convenience for looking up the grant scope, if loaded.
   */
  get grantScope() {
    return this.grant_scope_id
      ? this.store.peekRecord('scope', this.grant_scope_id)
      : null;
  }

  /**
   * A list of IDs for principals of type `user`.
   * @type {string[]}
   */
  get userIDs() {
    return this.principals
      .filter(({ type }) => type === 'user')
      .map(({ id }) => id);
  }

  /**
   * A list of IDs for principals of type `group`.
   * @type {string[]}
   */
  get groupIDs() {
    return this.principals
      .filter(({ type }) => type === 'group')
      .map(({ id }) => id);
  }

  /**
   * A list of IDs for principals of type `managed group`.
   * @type {string[]}
   */
  get managedGroupIDs() {
    return this.principals
      .filter(({ type }) => type === 'managed group')
      .map(({ id }) => id);
  }

  // =methods

  /**
   * Saves grant scope ids on the role via the `set-grant-scopes` method.
   * @param {[string]} grantScopeIDs
   * @return {Promise}
   */
  setGrantScopes(grantScopeIDs) {
    return this.save({
      adapterOptions: {
        method: 'set-grant-scopes',
        grantScopeIDs,
      },
    });
  }

  /**
   * Saves grant strings on the role via the `set-grants` method.
   * See serializer and adapter for more information.
   * @param {[string]} grantStrings
   * @return {Promise}
   */
  saveGrantStrings(grantStrings) {
    return this.save({
      adapterOptions: {
        method: 'set-grants',
        grantStrings,
      },
    });
  }

  /**
   * Adds principals via the `add-principals` method.
   * See serializer and adapter for more information.
   * @param {[string]} principalIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addPrincipals(principalIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-principals',
      principalIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete principals via the `remove-principals` method.
   * See serializer and adapter for more information.
   * @param {[string]} principalIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removePrincipals(principalIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-principals',
      principalIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete a single principal via the `remove-principals` method.
   * @param {number} principalIDs
   * @param {object} options
   * @return {Promise}
   */
  removePrincipal(principalID, options) {
    return this.removePrincipals([principalID], options);
  }
}
