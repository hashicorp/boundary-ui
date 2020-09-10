import ApplicationSerializer from './application';

export default class TargetSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.hostSets` is set to an array of host set models,
   * the resulting target serialization should include **only host sets**
   * and the version.  Normally, host sets are not serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const hostSetIDs = snapshot?.adapterOptions?.hostSetIDs;
    if (hostSetIDs) serialized =
      this.serializeWithHostSets(snapshot, hostSetIDs);
    return serialized;
  }

  /**
   * Returns a payload containing only the host_set_ids array using IDs
   * passed into the function (rather than existing host sets on the model).
   * @param {Snapshot} snapshot
   * @param {[string]} hostSetIDs
   * @return {object}
   */
  serializeWithHostSets(snapshot, hostSetIDs) {
    return {
      version: snapshot.attr('version'),
      host_set_ids: hostSetIDs
    };
  }

}
