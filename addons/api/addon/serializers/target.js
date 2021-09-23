import ApplicationSerializer from './application';

export default class TargetSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.hostSets` is set to an array of host set models,
   * the resulting target serialization should include **only host sets**
   * and the version.
   * If `adapterOptions.credentialLibraries` is set to an array of
   * credential library models, the resulting target serialization should
   * include **only credential libraries** and the version.
   * Normally, neither host sets or credential libraries are not serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const hostSourceIDs = snapshot?.adapterOptions?.hostSetIDs;
    if (hostSourceIDs) {
      serialized = this.serializeWithHostSources(snapshot, hostSourceIDs);
    }
    const credentialSourceIDs = snapshot?.adapterOptions?.credentialLibraryIDs;
    if (credentialSourceIDs)
      serialized = this.serializeWithCredentialSources(
        snapshot,
        credentialSourceIDs
      );
    return serialized;
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} hostSetIDs
   * @return {object}
   */
  serializeWithHostSources(snapshot, hostSourceIDs) {
    return {
      version: snapshot.attr('version'),
      host_source_ids: hostSourceIDs,
    };
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} credentialSourceIDs
   * @return {object}
   */
  serializeWithCredentialSources(snapshot, credentialSourceIDs) {
    return {
      version: snapshot.attr('version'),
      application_credential_source_ids: credentialSourceIDs,
    };
  }
}
