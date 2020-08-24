import ApplicationSerializer from './application';

export default class TargetSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.serializeHostSets` is true, the serialization should
   * include **only host sets** and the version.  Normally, host sets are not
   * serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serializeHostSets = snapshot?.adapterOptions?.serializeHostSets;
    let serialized = super.serialize(...arguments);
    if (serializeHostSets) serialized = this.serializeWithHostSets(snapshot);
    return serialized;
  }

  /**
   * Returns a payload containing only the host_set_ids array.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeWithHostSets(snapshot) {
    return {
      version: snapshot.attr('version'),
      host_set_ids:
        snapshot.attr('host_sets').map(hostSet => hostSet.attr('host_set_id'))
    };
  }

}
