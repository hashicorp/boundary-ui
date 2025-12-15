/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class RoleSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.serializeGrants` is true, the serialization should
   * include **only grants** and the version.  Normally, grants are not
   * serialized.
   * If `adapterOptions.principalIDs` is set (to an array of user and
   * group IDs), then the payload is serialized via `serializeWithPrincipals`.
   * If `adapterOptions.grantScopeIDs` is set (to an array of scope IDs or
   * keywords), then the payload is serialized via `serializeWithGrantScopeIDs`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);

    const grantStrings = get(snapshot, 'adapterOptions.grantStrings');
    if (grantStrings) {
      serialized = this.serializeWithGrantStrings(snapshot, grantStrings);
    }

    const principalIDs = snapshot?.adapterOptions?.principalIDs;
    if (principalIDs) {
      serialized = this.serializeWithPrincipals(snapshot, principalIDs);
    }

    const grantScopeIDs = snapshot?.adapterOptions?.grantScopeIDs;
    if (grantScopeIDs) {
      serialized = this.serializeWithGrantScopeIDs(snapshot, grantScopeIDs);
    }

    return serialized;
  }

  /**
   * Returns a payload containing only the grants array and version.
   * @param {Snapshot} snapshot
   * @param {[string]} grantStrings
   * @return {object}
   */
  serializeWithGrantStrings(snapshot, grantStrings) {
    return {
      version: snapshot.attr('version'),
      grant_strings: grantStrings,
    };
  }

  /**
   * Returns a payload containing only the principal_ids array using IDs passed
   * into the function (rather than existing principals on the model) and version.
   * @param {Snapshot} snapshot
   * @param {[string]} principalIDs
   * @return {object}
   */
  serializeWithPrincipals(snapshot, principalIDs) {
    return {
      version: snapshot.attr('version'),
      principal_ids: principalIDs,
    };
  }

  /**
   * Returns a payload containing only the grant_scope_ids array and version.
   * @param {Snapshot} snapshot
   * @param {[string]} grantScopeIDs
   * @return {object}
   */
  serializeWithGrantScopeIDs(snapshot, grantScopeIDs) {
    return {
      version: snapshot.attr('version'),
      grant_scope_ids: grantScopeIDs,
    };
  }
}
