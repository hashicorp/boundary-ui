import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class RoleSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.serializeGrants` is true, the serialization should
   * include **only grants** and the version.  Normally, grants are not
   * serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serializeGrants = get(snapshot, 'adapterOptions.serializeGrants');
    let serialized = super.serialize(...arguments);
    if (serializeGrants) serialized = this.serializeWithGrants(snapshot);
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
