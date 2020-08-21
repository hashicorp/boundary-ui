import ApplicationSerializer from './application';

export default class HostSetSerializer extends ApplicationSerializer {

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
    const serializeHostIDs = snapshot?.adapterOptions?.serializeHostIDs;
    let serialized = super.serialize(...arguments);
    if (serializeHostIDs) serialized = this.serializeWithHostIDs(snapshot);
    return serialized;
  }

  /**
   * Returns a payload containing only the host_ids array.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeWithHostIDs(snapshot) {
    return {
      version: snapshot.attr('version'),
      host_ids: snapshot.attr('host_ids').map(hostID => hostID.attr('value'))
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
    if (resourceHash.host_ids) {
      resourceHash.host_ids =
        resourceHash.host_ids.map(value => ({ value }));
    }
    return super.normalize(modelClass, resourceHash);
  }

}
