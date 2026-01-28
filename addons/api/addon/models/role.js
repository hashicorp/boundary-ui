/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedRoleModel from '../generated/models/role';
import { attr } from '@ember-data/model';
import { service } from '@ember/service';

export const GRANT_SCOPE_THIS = 'this';
export const GRANT_SCOPE_CHILDREN = 'children';
export const GRANT_SCOPE_DESCENDANTS = 'descendants';
export const GRANT_SCOPE_KEYWORDS = Object.freeze([
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
]);

// Sort the grant scope IDs by the order in which they should be displayed
// in the UI as the API will return them in an arbitrary order.
const sortOrder = {
  [GRANT_SCOPE_THIS]: 0,
  [GRANT_SCOPE_CHILDREN]: 1,
  [GRANT_SCOPE_DESCENDANTS]: 2,
  global: 3,
  o: 4,
  p: 5,
};

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
      const sortedScopeIDs = [...this.grant_scope_ids].sort((a, b) => {
        const aSplit = a.split('_')[0];
        const bSplit = b.split('_')[0];

        return sortOrder[aSplit] - sortOrder[bSplit];
      });

      sortedScopeIDs.forEach((id) => {
        if (GRANT_SCOPE_KEYWORDS.includes(id)) {
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
   * Helper for retrieving grant scope ids that are keywords.
   * @type {string[]}
   */
  get grantScopeKeywords() {
    return this.grant_scope_ids.filter((id) =>
      GRANT_SCOPE_KEYWORDS.includes(id),
    );
  }

  /**
   * Helper for retrieving grant_scope_ids that are orgs.
   * @type {string[]}
   */
  get grantScopeOrgIDs() {
    return this.grant_scope_ids.filter((id) => id.startsWith('o_'));
  }

  /**
   * Helper for retrieving grant_scope_ids that are projects.
   * @type {string[]}
   */
  get grantScopeProjectIDs() {
    return this.grant_scope_ids.filter((id) => id.startsWith('p_'));
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
