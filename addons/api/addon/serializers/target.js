/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { TYPE_TARGET_SSH } from '../models/target';

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
    const { type, isNew } = snapshot.record;
    const hostSourceIDs = snapshot?.adapterOptions?.hostSetIDs;
    if (hostSourceIDs) {
      serialized = this.serializeWithHostSources(snapshot, hostSourceIDs);
    }
    const brokeredCredentialSourceIDs =
      snapshot?.adapterOptions?.brokeredCredentialSourceIDs;
    const injectedApplicationCredentialSourceIDs =
      snapshot?.adapterOptions?.injectedApplicationCredentialSourceIDs;

    if (brokeredCredentialSourceIDs) {
      serialized = this.serializeWithBrokeredCredentialSources(
        snapshot,
        brokeredCredentialSourceIDs,
      );
    }
    if (injectedApplicationCredentialSourceIDs) {
      serialized = this.serializeWithInjectedApplicationCredentialSources(
        snapshot,
        injectedApplicationCredentialSourceIDs,
      );
    }

    if (isNew && serialized?.with_aliases) {
      // API expects scope id along with every alias value
      serialized.with_aliases = serialized.with_aliases.map((item) => ({
        ...item,
        scope_id: 'global',
      }));
    } else {
      // This field can't be updated, it is used only during creation time
      delete serialized.with_aliases;
    }
    // Delete session recording related fields from non-SSH targets
    if (type !== TYPE_TARGET_SSH) {
      delete serialized?.attributes?.storage_bucket_id;
      delete serialized?.attributes?.enable_session_recording;
    }
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
    brokered_credential_source_ids,
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
    injected_application_credential_source_ids,
  ) {
    return {
      version: snapshot.attr('version'),
      injected_application_credential_source_ids,
    };
  }

  /**
   * Returns a payload containing only version and storage bucket id,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @returns {object}
   */
  serializeWithStorageBucket(snapshot) {
    return {
      version: snapshot.attr('version'),
      storage_bucket_id: snapshot?.attr('storage_bucket_id'),
    };
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Ember data retains the previous entry in the array attr when the updated attr becomes undefined/empty.
    // So, we explicitly set the attr to an empty array if the updated attribute is undefined from the API

    if (!normalized.data.attributes.aliases) {
      normalized.data.attributes.aliases = [];
    }

    return normalized;
  }
}
