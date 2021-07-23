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
    const hostSetIDs = snapshot?.adapterOptions?.hostSetIDs;
    if (hostSetIDs)
      serialized = this.serializeWithHostSets(snapshot, hostSetIDs);
    const credentialLibraryIDs = snapshot?.adapterOptions?.credentialLibraryIDs;
    if (credentialLibraryIDs)
      serialized = this.serializeWithCredentialLibraries(
        snapshot,
        credentialLibraryIDs
      );
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
      host_set_ids: hostSetIDs,
    };
  }

  /**
   * Returns a payload containing only the credential_library_ids array using IDs
   * passed into the function (rather than existing credential libraries on the model).
   * @param {Snapshot} snapshot
   * @param {[string]} credentialLibraryIDs
   * @return {object}
   */
  serializeWithCredentialLibraries(snapshot, credentialLibraryIDs) {
    return {
      version: snapshot.attr('version'),
      application_credential_library_ids: credentialLibraryIDs,
    };
  }
}
