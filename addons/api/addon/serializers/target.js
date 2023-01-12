import ApplicationSerializer from './application';

export default class TargetSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.hostSets` is set to an array of host set models,
   * the resulting target serialization should include **only host sets**
   * and the version.
   * If `adapterOptions.credentialSources` is set to an array of
   * credential library and credential models, the resulting target serialization should
   * include **only credential libraries and crendentials** and the version.
   * Normally, neither host sets or credential libraries or credentials are not serialized.
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
    const brokeredCredentialSourceIDs =
      snapshot?.adapterOptions?.brokeredCredentialSourceIDs;
    const injectedApplicationCredentialSourceIDs =
      snapshot?.adapterOptions?.injectedApplicationCredentialSourceIDs;

    if (brokeredCredentialSourceIDs)
      serialized = this.serializeWithBrokeredCredentialSources(
        snapshot,
        brokeredCredentialSourceIDs
      );
    if (injectedApplicationCredentialSourceIDs)
      serialized = this.serializeWithInjectedApplicationCredentialSources(
        snapshot,
        injectedApplicationCredentialSourceIDs
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
   * @param {[string]} brokered_credential_source_ids
   * @return {object}
   */
  serializeWithBrokeredCredentialSources(
    snapshot,
    brokered_credential_source_ids
  ) {
    return {
      version: snapshot.attr('version'),
      brokered_credential_source_ids,
    };
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} injected_application_credential_source_ids
   * @return {object}
   */
  serializeWithInjectedApplicationCredentialSources(
    snapshot,
    injected_application_credential_source_ids
  ) {
    return {
      version: snapshot.attr('version'),
      injected_application_credential_source_ids,
    };
  }
}
