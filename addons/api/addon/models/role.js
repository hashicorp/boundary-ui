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
    // filter out scopes that start with an o_ or p_
    // then sort the keywords
    const grantScopes = [];
    if (this.grant_scope_ids) {
      const keywordIDs = this.grant_scope_ids.filter((id) => {
        return !id.startsWith('o_') && !id.startsWith('p_') && id !== 'global';
      });
      // using filter instead of find to get the global id and allow for
      // spreading into sortedScopeIDs if globalID is undefined
      const globalID = this.grant_scope_ids.filter((id) => {
        return id === 'global';
      });
      const orgIDs = this.grant_scope_ids.filter((id) => {
        return id.startsWith('o_');
      });
      const projectIDs = this.grant_scope_ids.filter((id) => {
        return id.startsWith('p_');
      });

      const sortedKeywords = keywordIDs.sort((a, b) => {
        return (
          GRANT_SCOPE_KEYWORDS.indexOf(a) - GRANT_SCOPE_KEYWORDS.indexOf(b)
        );
      });

      const sortedScopeIDs = [
        ...sortedKeywords,
        ...globalID,
        ...orgIDs,
        ...projectIDs,
      ];

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
