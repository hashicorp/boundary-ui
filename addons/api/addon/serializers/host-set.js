import ApplicationSerializer from './application';

export default class HostSetSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  // =methods

  /**
   * If `adapterOptions.serializeHostIDs` is true, the serialization should
   * include **only host_ids** and the version.  Normally, these are not
   * serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const hostIDs = snapshot?.adapterOptions?.hostIDs;
    if (hostIDs) serialized = this.serializeWithHostIDs(snapshot, hostIDs);
    return serialized;
  }

  /**
   * Returns a payload containing only the host_ids array.
   * @param {Snapshot} snapshot
   * @param {[string]} hostIDs
   * @return {object}
   */
  serializeWithHostIDs(snapshot, hostIDs) {
    return {
      version: snapshot.attr('version'),
      host_ids: hostIDs,
    };
  }

  /**
   * Converts string arrays to object arrays for use with `fragment-string`.
   * E.g. `"foo"` -> `{value: "foo"}`
   * @override
   * @param {Model} modelClass
   * @param {Object} resourceHash
   * @return {Object}
   */
  normalize(modelClass, resourceHash) {
    // TODO:  can fragment string normalization be handled generically?
    // TODO: host_ids might actually be attributes.host_ids
    if (resourceHash.host_ids) {
      resourceHash.host_ids = resourceHash.host_ids.map((value) => ({ value }));
    }
    return super.normalize(modelClass, resourceHash);
  }
}
