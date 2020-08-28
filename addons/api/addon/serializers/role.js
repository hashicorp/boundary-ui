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
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serializeGrants = get(snapshot, 'adapterOptions.serializeGrants');
    let serialized = super.serialize(...arguments);
    if (serializeGrants) serialized = this.serializeWithGrants(snapshot);
    const principalIDs = snapshot?.adapterOptions?.principalIDs;
    if (principalIDs) serialized =
      this.serializeWithPrincipals(snapshot, principalIDs);
    return serialized;
  }

  /**
   * Returns a payload containing only the grants array.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeWithGrants(snapshot) {
    return {
      version: snapshot.attr('version'),
      grant_strings: snapshot.attr('grants').map(grant => grant.attr('value'))
    };
  }

  /**
   * Returns a payload containing only the principal_ids array using IDs
   * passed into the function (rather than existing principals on the model).
   * @param {Snapshot} snapshot
   * @param {[string]} principalIDs
   * @return {object}
   */
  serializeWithPrincipals(snapshot, principalIDs) {
    return {
      version: snapshot.attr('version'),
      principal_ids: principalIDs
    };
  }

  /**
   * Converts string arrays to object arrays for use with `fragment-string`.
   * E.g. `"foo"` -> `{value: "foo"}`
   * @override
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalize(modelClass, resourceHash) {
    // TODO:  can fragment string normalization be handled generically?
    if (resourceHash.grant_strings) {
      resourceHash.grants =
        resourceHash.grant_strings.map(value => ({ value }));
    }
    return super.normalize(modelClass, resourceHash);
  }

}
