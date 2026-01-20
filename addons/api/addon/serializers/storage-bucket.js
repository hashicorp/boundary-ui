/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import {
  TYPE_CREDENTIAL_DYNAMIC,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from '../models/storage-bucket';

const fieldsByCredentialType = {
  static: [
    'access_key_id',
    'secret_access_key',
    'region',
    'disable_credential_rotation',
    'endpoint_url',
  ],
  dynamic: [
    'role_arn',
    'role_external_id',
    'role_session_name',
    'role_tags',
    'region',
    'disable_credential_rotation',
    'endpoint_url',
  ],
};
export default class StorageBucketSerializer extends ApplicationSerializer {
  /**
   * Serializes storage-bucket. ATM just AWS needs specific serialization,
   * for the other plugin types use default.
   * @param {object} snapshot
   * @returns
   */
  serialize(snapshot) {
    const { credentialType } = snapshot.record;
    const pluginType = snapshot.record.plugin?.name;
    const serialized = super.serialize(...arguments);

    // Common for all pluginTypes
    if (!snapshot.record.isNew) {
      delete serialized.bucket_name;
      delete serialized.bucket_prefix;
    }

    if (pluginType === TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3) {
      return this.serializeAws(serialized, credentialType);
    }

    return serialized;
  }

  /**
   * Returns a storage bucket serialized object specific for aws
   * @param {object} serialized
   * @param {string} credentialType
   * @returns
   */
  serializeAws(serialized, credentialType) {
    if (serialized.attributes) {
      if (credentialType === TYPE_CREDENTIAL_DYNAMIC) {
        serialized.attributes.disable_credential_rotation = true;
      }
      delete serialized.attributes.endpoint_url;
    }
    return serialized;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { credentialType } = snapshot.record;
    const { options } = attribute;

    // This deletes any fields that don't belong to the record's credential type
    if (options.isNestedAttribute && json.attributes) {
      // The key must be included in the fieldsByType list above
      if (!fieldsByCredentialType[credentialType].includes(key)) {
        // API requires these fields to be null
        json.attributes[key] = null;
      }
    }

    //json.secrets is only present, if there are any updates to the secret fields
    if (options.isNestedSecret && json.secrets) {
      if (!fieldsByCredentialType[credentialType].includes(key)) {
        delete json.secrets;
      }
    }
    return value;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);

    // Remove secret fields so we don't track them after creating/updating
    normalized.data.attributes.access_key_id = null;
    normalized.data.attributes.secret_access_key = null;
    return normalized;
  }
}
