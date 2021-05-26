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
}
