/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedRoleModel from '../generated/models/role';
import { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export const GRANT_SCOPE_THIS = 'this';
export const GRANT_SCOPE_CHILDREN = 'children';
export const GRANT_SCOPE_DESCENDANTS = 'descendants';
export const GRANT_SCOPE_KEYWORDS = Object.freeze([
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
]);

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
   * Convenience for looking up the grant scopes, if loaded.
   */
  get grantScopes() {
    const grantScopes = [];
    if (this.grant_scope_ids) {
      const sortedScopeIDs = this.grant_scope_ids.slice().sort((a, b) => {
        const aIndex = GRANT_SCOPE_KEYWORDS.indexOf(a);
        const bIndex = GRANT_SCOPE_KEYWORDS.indexOf(b);

        // both a and b are keywords
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // only a or b is a keyword
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        // only a is global
        if (a === 'global') return -1;
        // only b is global
        if (b === 'global') return 1;

        // both a and b are orgs - keep original order
        if (a.startsWith('o_') && b.startsWith('o_')) return 0;
        // only a is an org
        if (a.startsWith('o_')) return -1;
        // only b is an org
        if (b.startsWith('o_')) return 1;

        // both a and b are projects - keep original order
        if (a.startsWith('p_') && b.startsWith('p_')) return 0;
        // only a is a project
        if (a.startsWith('p_')) return -1;
        // only b is a project
        if (b.startsWith('p_')) return 1;

        // default - keep original order
        return 0;
      });

      sortedScopeIDs.forEach((id) => {
        if (
          id === GRANT_SCOPE_THIS ||
          id === GRANT_SCOPE_CHILDREN ||
          id === GRANT_SCOPE_DESCENDANTS
        ) {
          grantScopes.push({ id });
        } else {
          const scope = this.store.peekRecord('scope', id);
          if (scope) {
            grantScopes.push(scope);
          }
        }
      });
    }

    return grantScopes;
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
